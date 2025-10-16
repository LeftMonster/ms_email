from django.conf import settings
from django.contrib.auth import get_user_model
from knox.auth import TokenAuthentication

User = get_user_model()


class CustomTokenAuthentication(TokenAuthentication):
    """自定义的Knox Token认证，确保使用正确的User模型"""

    def authenticate_credentials(self, token_key):
        user, auth_token = super().authenticate_credentials(token_key)
        # 确保返回的是正确的用户模型实例
        if not isinstance(user, User):
            user = User.objects.get(pk=user.pk)
        return user, auth_token