import os
import json
from typing import Type, Any, Dict, Optional
from pydantic import BaseModel
from utils.logger import setup_logger

logger = setup_logger("GeminiService")

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.initialized = False

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.genai = genai
                self.initialized = True
                logger.info("Gemini AI Service initialized successfully.")
            except Exception as e:
                logger.error(f"Error configuring google-generativeai: {e}")
        else:
            logger.warning("GEMINI_API_KEY not found in environment. Running in mock-fallback mode.")

# Helper to resolve $ref pointers and unpack anyOf structures inline using the schema's $defs block
def resolve_schema_refs(schema: Any) -> Any:
    definitions = schema.get("$defs", {}) if isinstance(schema, dict) else {}

    def inline_ref(item: Any) -> Any:
        if isinstance(item, dict):
            # Inline/unpack anyOf nullable structures first
            if "anyOf" in item:
                any_of = item["anyOf"]
                non_null_types = [x for x in any_of if isinstance(x, dict) and x.get("type") != "null"]
                if non_null_types:
                    first = non_null_types[0]
                    unpacked = {k: v for k, v in item.items() if k != "anyOf"}
                    unpacked.update(first)
                    unpacked["nullable"] = True
                    return inline_ref(unpacked)
                else:
                    unpacked = {k: v for k, v in item.items() if k != "anyOf"}
                    unpacked["type"] = "string"
                    return inline_ref(unpacked)

            if "$ref" in item:
                ref_key = item["$ref"].split("/")[-1]
                resolved = definitions.get(ref_key, {})
                return inline_ref(resolved)

            return {k: inline_ref(v) for k, v in item.items()}
        elif isinstance(item, list):
            return [inline_ref(x) for x in item]
        return item

    inlined = inline_ref(schema)
    if isinstance(inlined, dict):
        inlined.pop("$defs", None)
    return inlined

# Helper to strip metadata keys (default, title, description) from schemas.
# We track parent_key to avoid stripping actual model properties named 'title' or 'description'.
def clean_schema_keys(item: Any, parent_key: Optional[str] = None) -> Any:
    if isinstance(item, dict):
        if parent_key != "properties":
            item.pop("default", None)
            item.pop("title", None)
            item.pop("description", None)
        
        return {k: clean_schema_keys(v, k) for k, v in item.items()}
    elif isinstance(item, list):
        return [clean_schema_keys(x, parent_key) for x in item]
    return item

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.initialized = False

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.genai = genai
                self.initialized = True
                logger.info("Gemini AI Service initialized successfully.")
            except Exception as e:
                logger.error(f"Error configuring google-generativeai: {e}")
        else:
            logger.warning("GEMINI_API_KEY not found in environment. Running in mock-fallback mode.")

    def generate_structured_output(
        self,
        prompt: str,
        response_schema: Type[BaseModel],
        fallback_data: Dict[str, Any],
        system_instruction: Optional[str] = None
    ) -> BaseModel:
        """
        Calls Gemini 1.5 Pro requesting a structured response matching the Pydantic schema.
        If the API call fails or key is missing, falls back to returning the provided fallback_data.
        """
        if not self.initialized:
            logger.warning("Gemini API not initialized. Using rule-based fallback response.")
            return response_schema.model_validate(fallback_data)

        try:
            # We use gemini-2.0-flash by default as it is fast, highly capable and available in this environment.
            model_name = "gemini-2.0-flash"
            
            # Convert Pydantic schema to OpenAPI schema
            raw_schema = response_schema.model_json_schema()
            resolved_schema = resolve_schema_refs(raw_schema)
            clean_schema = clean_schema_keys(resolved_schema)

            generation_config = {
                "temperature": 0.2,
                "response_mime_type": "application/json",
                "response_schema": clean_schema
            }

            response = None
            candidate_models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"]
            
            for candidate in candidate_models:
                try:
                    logger.info(f"Sending prompt to Gemini model ({candidate})...")
                    model = self.genai.GenerativeModel(
                        model_name=candidate,
                        system_instruction=system_instruction
                    )
                    response = model.generate_content(
                        prompt,
                        generation_config=generation_config
                    )
                    model_name = candidate
                    break
                except Exception as model_err:
                    if "not found" in str(model_err).lower() or "404" in str(model_err) or "not supported" in str(model_err).lower():
                        logger.warning(f"Model {candidate} not available/supported. Trying next candidate...")
                        continue
                    else:
                        raise model_err

            if not response:
                raise ValueError("No available Gemini models could be loaded or executed.")

            # Parse the response text
            result_json = json.loads(response.text)
            logger.info(f"Gemini structured output received and parsed successfully from {model_name}.")
            return response_schema.model_validate(result_json)

        except Exception as e:
            logger.error(f"Gemini API execution failed: {e}. Falling back to default schema output.")
            try:
                return response_schema.model_validate(fallback_data)
            except Exception as schema_err:
                logger.critical(f"Fallback data does not match Pydantic schema: {schema_err}")
                raise schema_err

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        fallback_text: str = "",
    ) -> str:
        """Plain-text generation for orchestrator planning."""
        if not self.initialized:
            return fallback_text
        try:
            model = self.genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=system_instruction,
            )
            response = model.generate_content(prompt)
            return (response.text or fallback_text).strip()
        except Exception as e:
            logger.error(f"Gemini text generation failed: {e}")
            return fallback_text

# Singleton instances
gemini_service = GeminiService()
