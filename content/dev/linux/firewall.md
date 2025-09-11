## CentOS 7 firewall 操作参考


### 常用方法

防火墙开机启动

```shell
systemctl enable firewalld.service
```

查看防火墙状态

```shell
firewall-cmd --state
```

开启防火墙

```shell
systemctl start firewalld.service
```

查看 active zones

```shell
firewall-cmd --get-active-zones
```

查看开放的端口

```shell
firewall-cmd --zone=public --list-ports
```

开放 8080 端口，关闭 80 端口

```shell
firewall-cmd --zone=public --add-port=8080/tcp --permanent
firewall-cmd --zone=public --remove-port=80/tcp --permanent
firewall-cmd --reload
```

重启

```shell
systemctl restart firewalld.service
```

重新加载载

```shell
firewall-cmd --reload
```



### 参考

> https://www.cnblogs.com/wolf-sun/p/9953667.html

> https://www.jb51.net/article/135124.htm
