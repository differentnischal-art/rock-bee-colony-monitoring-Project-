# rules/guidance.py

def get_guidance(user_role: str, risk: str, lat: float = 0.0, lon: float = 0.0) -> dict:
    """
    Generate Do & Don't instructions based on
    user role and risk level.
    """

    # Normalize inputs to avoid errors
    user_role = user_role.lower()
    risk = risk.lower()

    # ----------------------------------------
    # CASE 1: FARMER (Ecology-first priority)
    # ----------------------------------------
    if user_role == "farmer":
        return {
            "dos": [
                "Allow natural bee activity for pollination",
                "Observe the colony from a safe distance"
            ],
            "donts": [
                "Do NOT spray pesticides near the farm",
                "Do NOT disturb or destroy the bee colony"
            ],
            "advisory": (
                "Rock bees are essential for crop pollination. "
                "Avoid pesticide use in this area for the next few days."
            )
        }

    # ----------------------------------------
    # CASE 2: HIGH RISK (Public / Crowded area)
    # ----------------------------------------
    if risk == "high":
        return {
            "dos": [
                "Maintain a safe distance from the colony",
                "Inform authorities using the app",
                "Warn nearby people calmly"
            ],
            "donts": [
                "Do NOT throw stones or objects",
                "Do NOT spray water, smoke, or chemicals",
                "Do NOT attempt to remove the hive yourself"
            ],
            "advisory": (
                "This colony is in a high-risk area and "
                "requires expert intervention."
            )
        }

    # CASE 4: CONSERVATION ZONE (Mock logic based on coordinates)
    # Let's say lat 10-15 and lon 75-80 is a sensitive conservation area
    if 10.0 <= lat <= 15.0 and 75.0 <= lon <= 80.0:
        return {
            "dos": [
                "Strictly maintain distance (min 20 meters)",
                "Report immediately to Forest Department",
                "Keep area quiet"
            ],
            "donts": [
                "NO photography with flash",
                "NO presence of humans for long durations",
                "Absolutely NO chemical usage"
            ],
            "advisory": "You are in a SENSITIVE Rock Bee Conservation Zone. Extreme care is required."
        }

    # ----------------------------------------
    # CASE 5: LOW RISK / GENERAL PUBLIC
    # ----------------------------------------
    return {
        "dos": [
            "Maintain a safe distance",
            "Stay calm and observe the situation"
        ],
        "donts": [
            "Do NOT disturb the bee colony",
            "Do NOT create panic near the area"
        ],
        "advisory": "Low risk detected. Continue monitoring the situation."
    }
