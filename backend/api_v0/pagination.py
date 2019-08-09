from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class WordTabsPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 10

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total': self.page.paginator.num_pages,
            'results': data,
        })
