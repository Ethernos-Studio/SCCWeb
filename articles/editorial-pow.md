# [SCC-G2026] 乘法表 题解

## 题目大意

本题是一道循环语句入门题。

要求读入一个整数 `n`，输出一个 `n` 行的三角乘法表：

* 第 1 行输出 `1×1`
* 第 2 行输出 `1×2 2×2`
* 第 3 行输出 `1×3 2×3 3×3`
* ...
* 第 `n` 行输出 `1×n 2×n ... n×n`

本题主要考察：

1. 变量的定义和输入；
2. `for` 循环的使用；
3. **双重循环**控制行和列；
4. 字符串格式化输出。

---

## 思路分析

乘法表有明显的规律：

* 外层循环控制“第几行”；
* 内层循环控制这一行输出多少个乘法式。

例如：

```
n = 4

1*1=1
1*2=2 2*2=4
1*3=3 2*3=6 3*3=9
1*4=4 2*4=8 3*4=12 4*4=16
```

因此：

* 外层循环：`i = 1 ~ n`
* 内层循环：`j = 1 ~ i`

每输出一个乘法式后，在同一行继续输出；
一行结束后换行。

---

# 代码实现

## Python

Python 使用 `for` 循环遍历数字范围。

`range(1, i+1)` 表示：

从 `1` 开始，一直到 `i`（包含 `i`）。

```python
n = int(input())

# 外层循环控制行数
for i in range(1, n + 1):

    # 内层循环控制当前行输出几个乘法式
    for j in range(1, i + 1):
        print(f"{j}*{i}={i*j}", end=" ")

    # 当前行结束，换行
    print()
```

---

## C++

C++ 中使用两个 `for` 循环完成控制。

外层循环决定当前是第几行，
内层循环决定这一行输出多少项。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    // 控制行
    for (int i = 1; i <= n; i++) {

        // 控制当前行的数量
        for (int j = 1; j <= i; j++) {
            cout << j << "*" << i << "=" << i * j << " ";
        }

        cout << endl;
    }

    return 0;
}
```

---

## Java

Java 中使用 `Scanner` 读取输入。

注意：

`System.out.print()` 不会自动换行，
所以每完成一行后需要使用 `println()`。

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt();

        // 控制行
        for (int i = 1; i <= n; i++) {

            // 控制当前行输出数量
            for (int j = 1; j <= i; j++) {
                System.out.print(j + "*" + i + "=" + i * j + " ");
            }

            System.out.println();
        }
    }
}
```

---

## Haskell

> Haskell 是一种函数式编程语言，与 C++、Python 等命令式语言相比，语法风格有所不同。

不过在竞争性编程中，我们通常希望先掌握**算法思想**，再学习语言特性。因此，本题使用 `forM_` 模拟传统循环，让代码结构与其他语言保持一致。

`forM_` 可以理解为：

```text
for 每一个元素:
    执行一段代码
```

例如：

```haskell
forM_ [1..n] $ \i -> do
    ...
```

就相当于其他语言中的：

```cpp
for (int i = 1; i <= n; i++) {
    ...
}
```

本题需要两层循环：

* 外层循环控制第几行；
* 内层循环控制当前行输出多少个乘法式。

代码如下：

```haskell
import Control.Monad (forM_)

main :: IO ()
main = do
    n <- readLn

    -- 外层循环，控制行数
    forM_ [1..n] $ \i -> do

        -- 内层循环，控制当前行输出数量
        forM_ [1..i] $ \j -> do
            putStr (show j ++ "*" ++ show i ++ "=" ++ show (i * j) ++ " ")

        -- 一行结束后换行
        putStrLn ""
```

### 代码说明

例如输入：

```text
4
```

外层循环依次取：

```text
i = 1, 2, 3, 4
```

当：

```haskell
i = 3
```

内层循环：

```haskell
[1..i]
```

会生成：

```text
[1,2,3]
```

于是输出：

```text
1*3=3 2*3=6 3*3=9
```

最终得到完整的三角乘法表。

---

### 扩展：列表推导式写法

Haskell 还可以使用列表推导式非常简洁地生成乘法表：

```haskell
[unwords [show j ++ "*" ++ show i ++ "=" ++ show (i*j) | j <- [1..i]] | i <- [1..n]]
```

这种写法充分体现了 Haskell 的函数式特点，但它将循环过程隐藏在表达式中。

对于本题这种**循环入门题**，推荐优先理解 `forM_` 的写法；列表推导式可以作为学习 Haskell 后进一步了解的高级技巧。

---

## Rust

Rust 同样支持循环。

本题使用普通 `for` 循环实现，不使用 `map` 等函数式写法，使代码逻辑更接近题目的考察内容。

```rust
use std::io;

fn main() {
    let mut input = String::new();

    io::stdin()
        .read_line(&mut input)
        .unwrap();

    let n: usize = input.trim().parse().unwrap();

    // 控制行
    for i in 1..=n {

        // 控制当前行输出数量
        for j in 1..=i {
            print!("{}*{}={} ", j, i, i * j);
        }

        println!();
    }
}
```

---

## 总结

本题的核心不是乘法计算，而是理解**双重循环**：

```
外层循环：决定第几行
        ↓
内层循环：决定这一行输出几个式子
```

掌握这种结构后，可以解决大量类似问题，例如：

* 输出图形；
* 打印矩阵；
* 枚举二维数据；
* 模拟棋盘等。
