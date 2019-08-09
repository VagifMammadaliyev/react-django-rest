from rest_framework.throttling import UserRateThrottle

class TwicePerDayUserThrottle(UserRateThrottle):
        rate = '2/day'
