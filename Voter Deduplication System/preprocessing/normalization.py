import re

def normalize_name(name):
    if not name:
        return ""
    # Convert to uppercase, remove non-alphanumeric (except space), strip whitespace
    name = str(name).upper()
    name = re.sub(r'[^A-Z0-9\s]', '', name)
    name = " ".join(name.split())
    return name

def normalize_dob(dob):
    if not dob:
        return ""
    # Keep only digits and hyphens/slashes, then standardize to YYYY-MM-DD if possible
    dob = str(dob).strip()
    return dob

def normalize_mobile(mobile):
    if not mobile:
        return ""
    # Keep only digits, remove leading 0 or +91
    mobile = re.sub(r'\D', '', str(mobile))
    if len(mobile) > 10:
        if mobile.startswith("91"):
            mobile = mobile[2:]
        elif mobile.startswith("0"):
            mobile = mobile[1:]
    return mobile[-10:] if len(mobile) >= 10 else mobile

def normalize_address(address):
    if not address:
        return ""
    # Convert to uppercase, remove punctuation, strip whitespace
    address = str(address).upper()
    address = re.sub(r'[^A-Z0-9\s]', ' ', address)
    address = " ".join(address.split())
    return address
