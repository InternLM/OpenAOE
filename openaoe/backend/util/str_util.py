from fastapi import HTTPException
import os
from typing import List
import random
import string


def safe_join(directory: str, path: str) -> str:
    """
    Safely path to a base directory to avoid escaping the base directory.
    Borrowed from: werkzeug.security.safe_join
    @param directory:
    @param path:
    """
    _os_alt_seps: List[str] = [
        sep for sep in [os.path.sep, os.path.altsep] if sep is not None and sep != "/"
    ]

    if path == "":
        raise HTTPException(status_code=400, detail="path is empty")

    filename = os.path.normpath(path)
    full_path = os.path.join(directory, filename)
    print(f"full_path={full_path}")
    if (
            any(sep in filename for sep in _os_alt_seps)
            or os.path.isabs(filename)
            or filename == ".."
            or filename.startswith("../")
            or os.path.isdir(full_path)
    ):
        raise HTTPException(status_code=400, detail="path is illegal")

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="path is not existed")
    return full_path


def generate_random_string(length: int):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str

