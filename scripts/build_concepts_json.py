from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft7Validator
from jsonschema.exceptions import ValidationError

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / 'schema' / 'concept.schema.json'
CONCEPTS_DIR = ROOT / 'concepts'
OUTPUT_PATH = ROOT / 'viewer' / 'public' / 'concepts.json'
VERSION = '0.1.0'


class BuildError(Exception):
    """Raised when the concept bundle cannot be built."""


def load_schema() -> dict[str, Any]:
    try:
        with SCHEMA_PATH.open('r', encoding='utf-8') as handle:
            return json.load(handle)
    except FileNotFoundError as exc:
        raise BuildError(f'Missing schema file: {SCHEMA_PATH}') from exc
    except json.JSONDecodeError as exc:
        raise BuildError(f'Invalid JSON in schema file {SCHEMA_PATH}: {exc.msg}') from exc


def format_validation_error(error: ValidationError) -> str:
    path = '.'.join(str(part) for part in error.absolute_path)
    if path:
        return f'{path}: {error.message}'
    return error.message


def parse_yaml(path: Path) -> dict[str, Any]:
    try:
        with path.open('r', encoding='utf-8') as handle:
            data = yaml.safe_load(handle)
    except yaml.YAMLError as exc:
        raise BuildError(f'{path.name}: invalid YAML ({exc})') from exc

    if not isinstance(data, dict):
        raise BuildError(f'{path.name}: top-level YAML document must be an object')
    return data


def enrich_concept(concept: dict[str, Any], filename: str) -> dict[str, Any]:
    enriched = dict(concept)
    enriched['_source'] = filename

    repository = os.getenv('GITHUB_REPOSITORY')
    if repository:
        enriched['_github_url'] = f'https://github.com/{repository}/blob/main/concepts/{filename}'

    return enriched


def validate_concepts() -> dict[str, Any]:
    schema = load_schema()
    validator = Draft7Validator(schema)
    concept_files = sorted(CONCEPTS_DIR.glob('*.yml'))

    if not concept_files:
        raise BuildError(f'No concept files found in {CONCEPTS_DIR}')

    concepts: list[dict[str, Any]] = []
    seen_ids: dict[str, str] = {}

    for path in concept_files:
        concept = parse_yaml(path)
        errors = sorted(validator.iter_errors(concept), key=lambda error: list(error.absolute_path))
        if errors:
            message = '; '.join(format_validation_error(error) for error in errors)
            raise BuildError(f'{path.name}: schema validation failed ({message})')

        concept_id = concept['id']
        expected_id = path.stem
        if concept_id != expected_id:
            raise BuildError(
                f"{path.name}: id '{concept_id}' does not match filename '{expected_id}'"
            )

        if concept_id in seen_ids:
            raise BuildError(
                f"{path.name}: duplicate concept id '{concept_id}' also found in {seen_ids[concept_id]}"
            )

        seen_ids[concept_id] = path.name
        concepts.append(enrich_concept(concept, path.name))

    valid_ids = {concept['id'] for concept in concepts}
    for concept in concepts:
        for relation in concept.get('relations', []):
            target = relation['target']
            if target not in valid_ids:
                raise BuildError(
                    f"{concept['_source']}: relation target '{target}' does not resolve to a concept id"
                )

    bundle = {
        'version': VERSION,
        'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'concept_count': len(concepts),
        'concepts': concepts,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open('w', encoding='utf-8') as handle:
        json.dump(bundle, handle, indent=2)
        handle.write('\n')

    return bundle


def main() -> int:
    try:
        bundle = validate_concepts()
    except BuildError as exc:
        print(f'Error: {exc}', file=sys.stderr)
        return 1

    print(f"✓ {bundle['concept_count']} concepts validated → viewer/public/concepts.json")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
