import hashlib
from typing import Optional


def md5_generate(raw: str) -> Optional[str]:
    if raw is None:
        return None
    md5 = hashlib.md5(raw.encode())
    return md5.hexdigest()


if __name__ == "__main__":
    pass
