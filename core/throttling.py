from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class AuthRateThrottle(AnonRateThrottle):
    """Rate throttle for sensitive authentication routes (login, signup) - 15/minute."""
    scope = 'auth'
    rate = '15/minute'

class ActionRateThrottle(UserRateThrottle):
    """Rate throttle for state-mutating actions (bookings, payments) - 30/minute."""
    scope = 'actions'
    rate = '30/minute'

class DirectoryRateThrottle(AnonRateThrottle):
    """Rate throttle for public directory search & listings - 100/minute."""
    scope = 'directory'
    rate = '100/minute'
