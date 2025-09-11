## Lua 开发 Tips



[TOC]



#### 善用局部变量

Lua 中寄存器充足，在预编译时能够将局部变量（local）存放到寄存器中，访问局部变量的速度会快很多 。

比如以下代码:

```lua
for i = 1, 1000000 do
local x= math.sin(i)
end
```

会比以下代码慢 30%：

```lua
local sin = math.sin
for i = 1, 1000000 do
local x= sin(i)
end
```

参考

> https://blog.csdn.net/u013097730/article/details/52411658/



#### 减少表的插入次数

Lua 中的表由一个数组和一个哈希表组成，每一次从表中插入数据，Lua都会重新计算每个元素新的存放位置，导致插入的效率很低。

```lua
local a = {}
a[1] = 1 -- 重新哈希，数组部分大小为1
a[2] = 2 -- 重新哈希，数组部分大小为2
a[3] = 3 -- 重新哈希，数组部分大小为4
```

以上的代码产生三次重新哈希计算以及三次数组部分扩容，相比以下代码只执行了一次哈希和扩容。

```lua
local a = {true, true, true} -- 重新哈希，数组部分大小为4
a[1] = 1
a[2] = 2
a[3] = 3
```

> https://blog.csdn.net/wihing/article/details/6962695



#### 删除表中所有元素

```lua
for k in pairs(t) do
t[k] = nil
end
```

> https://blog.csdn.net/u013097730/article/details/52411658/



#### 如何遍历 Lua 字符串的字符



整理了 5 个版本，先说结论：

**简单测试下，版本 1 和版本 5 相对比快，考虑编码方面，建议采用版本 1**



版本 1

```lua
local stringsub = string.sub

for i = 1, #str do
c = stringsub(str, i)
end
```

版本 2

```lua
local stringgmatch = string.gmatch

for c in stringgmatch(str, ".") do
end
```

版本 3

```lua
local stringgsub = string.gsub

stringgsub(str, ".", function(c) end)
```

版本 4

```lua
local str2table = function(str)
local ret = {}
for i = 1, #str do
ret[i] = stringsub(str, i) -- Note: This is a lot faster than using table.insert
end
return ret
end

for i = 1, #tbl do -- Note: This type of loop is a lot faster than "pairs" loop.
c = tbl[i]
end
```

版本 5

```lua
local stringbyte = string.byte
local stringchar = string.char

tbl = {stringbyte(str, 1, #str)} -- Note: This is about 15% faster than calling string.byte for every character.
for i = 1, #tbl do
c = stringchar(tbl[i])
end
```

相同字符串，多次循环对比耗时测试如下

```
V1: elapsed time: 3.713
V2: elapsed time: 5.089
V3: elapsed time: 5.222
V4: elapsed time: 4.066
V5: elapsed time: 3.627
```

参考

> https://stackoverflow.com/questions/829063/how-to-iterate-individual-characters-in-lua-string
