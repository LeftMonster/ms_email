import platform

from utils.config_util import get_env

sys_name = platform.system()
if get_env() == "PROD":
    import pymysql
    pymysql.install_as_MySQLdb()
elif sys_name == "Windows" and get_env() == "DEV":
    import pymysql
    pymysql.install_as_MySQLdb()
elif sys_name == "Linux":
    import pymysql
    pymysql.install_as_MySQLdb()