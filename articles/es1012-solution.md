# (ES1012) T715423 [SCC-G2026] 质数 (prime) — 入门题解

[题目链接](https://luogu.com.cn/problem/T715423)

## 一、什么是质数？

质数（素数）是**大于 1** 的自然数，并且**只能被 1 和它自己整除**。

| 数字 | 是不是质数 | 原因                        |
| :--: | :--------: | :-------------------------- |
|  1  |     ❌     | 质数定义要求大于 1          |
|  2  |     ✅     | 只能被 1 和 2 整除          |
|  3  |     ✅     | 只能被 1 和 3 整除          |
|  4  |     ❌     | 可以被 2 整除（4 = 2 × 2） |
|  5  |     ✅     | 只能被 1 和 5 整除          |
|  9  |     ❌     | 可以被 3 整除（9 = 3 × 3） |

## 二、解题思路：试除法

要判断 `n` 是不是质数，最直接的办法就是**试着除一遍**。

### 步骤

1. **特判小数字**：如果 `n <= 1`，直接输出 `No`；如果 `n == 2`，直接输出 `Yes`。
2. **排除偶数**：如果 `n` 是大于 2 的偶数，一定不是质数（因为它能被 2 整除）。
3. **试除奇数**：从 3 开始，只用**奇数**去试除（2, 4, 6… 已经在第 2 步排除了），一直试到 `√n`。
   - 如果中间有一个数能整除 `n`，`n` 就不是质数。
   - 如果试完都没有找到能整除的，`n` 就是质数。

### 为什么只需要试到 √n？

假设 `n` 有一个因数 `a`，那么一定存在另一个因数 `b`，使得 `n = a × b`。

- 如果 `a` 和 `b` 都大于 `√n`，那么 `a × b > n`，矛盾。
- 所以 `a` 和 `b` 中**至少有一个 ≤ √n**。

也就是说，只要 `n` 有因数，就一定能在 `√n` 以内找到。

---

## 三、参考代码

### C++（最常用）

```cpp
#include <bits/stdc++.h>
using namespace std;

// 判断 n 是否为质数
bool isPrime(long long n) {
    if (n <= 1) return false;   // 1 不是质数
    if (n == 2) return true;    // 2 是唯一的偶质数
    if (n % 2 == 0) return false; // 其他偶数都不是质数
  
    // 只试除奇数，从 3 开始，到 n / i 为止（避免 i*i 溢出）
    for (long long i = 3; i <= n / i; i += 2) {
        if (n % i == 0) return false; // 找到了因数
    }
    return true; // 没找到因数，是质数
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
  
    long long n;
    cin >> n;
    cout << (isPrime(n) ? "Yes" : "No") << '\n';
    return 0;
}
```

---

### Python（最简洁）

```python
import math

n = int(input())

if n <= 1:
    print("No")
elif n == 2:
    print("Yes")
elif n % 2 == 0:
    print("No")
else:
    is_prime = True
    # 只检查奇数，到平方根为止
    # math.isqrt(n) 表示 n 的整数平方根
    for i in range(3, math.isqrt(n) + 1, 2):
        if n % i == 0:
            is_prime = False
            break
    print("Yes" if is_prime else "No")
```

---

### Java

```java
import java.util.Scanner;

public class Main {
    static boolean isPrime(long n) {
        if (n <= 1) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
    
        // 试除奇数，用 i <= n / i 防止溢出
        for (long i = 3; i <= n / i; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }
  
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        System.out.println(isPrime(n) ? "Yes" : "No");
    }
}
```

---

### Haskell（函数式风格）

```haskell
import System.IO

-- 判断质数的函数
isPrime :: Integer -> Bool
isPrime n
    | n <= 1    = False          -- 1 及以下不是质数
    | n == 2    = True           -- 2 是质数
    | even n    = False          -- 其他偶数不是质数
    | otherwise = all (\i -> n `mod` i /= 0) candidates
  where
    -- 候选除数：从 3 开始步长为 2 的奇数，直到 sqrt(n)
    candidates = [3, 5 .. floor (sqrt (fromIntegral n))]

main :: IO ()
main = do
    n <- readLn                  -- 读取一个整数
    putStrLn $ if isPrime n then "Yes" else "No"
```

**Haskell 要点**：

- `even n` 判断是否为偶数。
- `[3, 5 .. x]` 生成从 3 开始、步长为 2 的列表（即所有奇数）。
- `all` 检查列表里**所有**元素都满足条件（都不能整除 `n`）。
- `fromIntegral` 把整数转成浮点数，才能用 `sqrt` 开方。

---

### Rust

```rust
use std::io;

fn is_prime(n: u64) -> bool {
    if n <= 1 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }
  
    let mut i = 3;
    while i <= n / i {  // 防止 i*i 溢出
        if n % i == 0 {
            return false;
        }
        i += 2;  // 只检查奇数
    }
    true
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let n: u64 = input.trim().parse().unwrap();
  
    println!("{}", if is_prime(n) { "Yes" } else { "No" });
}
```

---

## 四、复杂度分析

| 项目                 | 内容                                                    |
| :------------------- | :------------------------------------------------------ |
| **时间复杂度** | $O(\sqrt{n})$，最多试除 $\frac{\sqrt{n}}{2}$ 个奇数 |
| **空间复杂度** | $O(1)$，只用到几个变量                                |

对于 SCC-G 语法组的数据范围，试除法完全够用。

---

## 五、常见坑点

1. **忘记特判 1**：`1` 不是质数！
2. **忘记特判 2**：`2` 是质数，但它是偶数，如果不特判会被偶数排除逻辑误杀。
3. **`i * i <= n` 溢出**：如果 `n` 接近 `10^18`，`i * i` 可能溢出。用 `i <= n / i` 更安全。
4. **步长写错**：试除时步长应该是 `2`（只走奇数），写成 `1` 会多判一倍，虽然不会错但会慢。

---

## 六、总结

| 步骤 | 操作                               |
| :--- | :--------------------------------- |
| ①   | `n <= 1` → `No`               |
| ②   | `n == 2` → `Yes`              |
| ③   | `n` 是偶数 → `No`             |
| ④   | 从 3 开始，每隔 2 试除到`√n`    |
| ⑤   | 找到因数 →`No`，否则 → `Yes` |

这就是最经典的**试除法判质数**，所有入门选手必须掌握的基本功。
