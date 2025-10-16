from django.apps import AppConfig
from django.db.models.signals import class_prepared


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # 修复 knox 的 AuthToken 模型
        handle_class_prepared = lambda sender, **kwargs: self.handle_auth_token_preparation(sender)
        class_prepared.connect(handle_class_prepared)

    def handle_auth_token_preparation(self, sender):
        # 如果处理的是 knox 的 AuthToken 模型
        if sender.__name__ == 'AuthToken' and sender.__module__ == 'knox.models':
            from django.conf import settings
            from django.db import models

            # 获取正确的用户模型
            from django.contrib.auth import get_user_model
            User = get_user_model()

            # 修复用户外键字段
            user_field = sender._meta.get_field('user')
            user_field.remote_field.model = User
            user_field.remote_field.related_name = 'auth_token_set'