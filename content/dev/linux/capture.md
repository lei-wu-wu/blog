## 抓包速查表



### 常用方法

截获 eth0 网卡 80 端口的报文，-s0 防止包截断，并直接以 IP 及 port number 显示

```shell
tcpdump -i eth0 -nn -s0 -v port 80
```

截获1.1.1.1主机所有收到的和发出的的报文，并把信息打印到 stdout

```shell
tcpdump ‘host 1.1.1.1’
```

截获主机 1.1.1.1 和主机 1.1.1.2 或 192.168.111.3 的通信，并且不做解析

```shell
tcpdump ‘host 1.1.1.1 and 1.1.1.2 or 192.168.111.3’ -n
```

截获主机 1.1.1.1 除了和主机 1.1.1.2 之外所有主机通信的 IP 包

```shell
tcpdump ‘host 1.1.1.1 and !1.1.1.2’ -n
```

截获源 IP 是 210.2.2.4 主机发送给目的端口 6800 的所有报文，并把它保存到 a.cap 文件中

```shell
tcpdump 'src host 210.2.2.4 and dst port 6800' -s 1500 -w a.cap
```



### 参数说明

```shell
-n ：不解析地址，直接以 IP 及 port number 显示，而非主机名与服务名称
-i ：后面接要『监听』的网络接口，例如 eth0, lo, ppp0 等等
-c ：抓包数量，如果没有这个参数， tcpdump 会持续不断的监听，直到使用者输入 [ctrl]-c 为止
-e ：输出dump的报文的链路层(OSI 第二层)信息（包括源目MAC和以太类型
-q ：quick mode，仅列出较为简短的封包信息，每一行的内容比较精简
-s ：抓包的长度，默认是96字节。如果要把报文保存下来分析，需配置此参数
-A ：抓包内容以 ASCII 显示，做WWW 的网页抓包分析很有用
-X ：可以列出十六进制 (hex) 以及 ASCII 的抓包内容，对于观察内容很有用
-r ：从后面接的文件中读取数据，这个『文件』是由 -w 所生成的
-w ：把抓取数据保存到文件，后面接文件名
-v ：verbose output，打印详细的输出
-vv ：more verbose output，打印更加详细的输出
```



### 参考

> https://www.tcpdump.org/manpages/tcpdump.1.html

> https://www.runoob.com/linux/linux-comm-tcpdump.html

> https://www.zhihu.com/question/403959433/answer/2146997897

> https://www.cnblogs.com/ggjucheng/archive/2012/01/14/2322659.html

> https://www.cnblogs.com/maifengqiang/p/3863168.html
