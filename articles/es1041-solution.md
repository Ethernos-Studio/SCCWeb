# 迷宫计数 · 官方题解

> 一个迷宫，不一定是一棵树；一个连通块，也不一定非得被走到。

[更好的观感](https://www.luogu.com.cn/article/6s8z3fzz)

[更好的观感(luogu.me)](https://www.luogu.me/article/6s8z3fzz)

## 先看这里：这题到底在数什么
每扇门有开、关两种状态，一个迷宫就是 $2^{\text{门数}}$ 种选择中的一种。题目给出每个房间"开着的门的个数"，要求在所有满足度数的迷宫里，数出 $S$ 与 $E$ 连通的个数。

本题与经典"回路插头 DP"的区别有三点：

1. **允许成环**，图不要求是树或单个回路。
2. **允许多个连通块**，也允许孤立点（$a_{i,j}=0$）。
3. 只关心 $S,E$ 是否连通，其余连通块长什么样与答案无关。

## 数据范围与子任务

| 测试点编号 | 子任务 | $\min(n,m)\le$ | 特殊性质 | 分值 |
| :-: | :-: | :-: | :-: | :-: |
| $1\sim5$ | $1$ | $4$ | $n\cdot m\le16$ | $10$ |
| $6\sim10$ | $2$ | $3$ | 无 | $15$ |
| $11\sim15$ | $3$ | $7$ | $S=E$ | $15$ |
| $16\sim25$ | $4$ | $5$ | 无 | $20$ |
| $26\sim45$ | $5$ | $7$ | 无 | $40$ |

## 部分分

### 子任务 1（$n\cdot m\le16$）：暴力枚举
门的总数不超过 $24$（$4\times4$ 的网格恰有 $24$ 扇门）。枚举所有 $2^{24}$ 种开关方案，检查每个房间的度数，再用并查集判断 $S,E$ 是否连通即可。

### 子任务 3（$S=E$）：不需要连通性
$S=E$ 时每个合法迷宫都满足条件，答案就是满足度数约束的迷宫总数。这是一个纯状压 DP，不用记连通性：

按行优先逐格处理，轮廓线上记 $m+1$ 位"这条门是否开着"。处理 $(i,j)$ 时，左门和上门已定，枚举右门 $r$ 和下门 $d$，要求 $[L]+[U]+r+d=a_{i,j}$。状态数 $2^{m+1}$，复杂度 $O(nm\cdot2^{m}\cdot4)$。

子任务 2、4（$\min(n,m)\le3$ 或 $\le5$）用满分做法即可通过，只是状态数更少，目的是给常数大、实现慢的做法留出得分空间。

## 正解

### 1. 先转置

由 $\min(n,m)\le7$，若 $m>n$ 就把网格转置（同时交换 $S,E$ 的横纵坐标），保证列数 $w=\min(n,m)\le7$。下面记行数为 $n$，列数为 $m$，$m\le7$。

### 2. 状态

按行优先逐格转移，状态是轮廓线上 $m+1$ 个插头：

- 每个插头记录这条门是否开着。
- 开着的插头用**连通块标号**表示哪些插头属于同一个连通块（按第一次出现的顺序归一化）。
- 每个连通块带 $2$ 个标记位：是否含 $S$、是否含 $E$。
- 一个 $\text{done}$ 位，表示 $S,E$ 已经确认连通。

处理 $(i,j)$ 时，下标 $j$ 是它的左插头，下标 $j+1$ 是它的上插头；处理完后下标 $j$ 变成下插头，下标 $j+1$ 变成右插头。每行结束时整体右移一位，最左补 $0$。

### 3. 转移

设左插头为 $L$，上插头为 $U$，枚举右门 $r$ 和下门 $d$（最后一列 $r$、最后一行 $d$ 强制为 $0$），要求
$$[L>0]+[U>0]+r+d=a_{i,j}.$$

1. 把 $L$、$U$ 所在的连通块合并。若 $L,U$ 本来就在同一块，说明成环，**合法，不用特判**。
2. 当前格自己的 $S/E$ 标记并入这个块；若 $L,U$ 都没有，当前格自成新块。
3. 若 $r=d=0$，并且合并后的块**不再出现在轮廓线上**，这个块就封闭了：
   - 标记为 $S,E$ 都含：置 $\text{done}=1$；
   - 只含 $S$ 或只含 $E$：这个状态永远不可能连通，丢弃；
   - 都不含：正常继续。

答案是最终 $\text{done}=1$ 的状态方案数之和。

#### $S=E$ 为什么不用特判
$S=E$ 时当前格自带两个标记，它所在的块封闭时标记为 $3$，自然得到 $\text{done}=1$。另外，一个块只要含 $S,E$ 两个标记，即使还没封闭，最终也一定会封闭，所以不必在"刚合并出标记 $3$"时提前设 $\text{done}$。

### 4. 复杂度

插头最多 $m+1\le8$ 个，非交叉划分数加上标记，理论上状态数不会超过几万。度数约束 $a_{i,j}$ 在每一格都把转移限制到至多 $4$ 种且往往只剩一两种，所以实际状态很少：我们数据中宽度为 $7$ 的点，轮廓线上的状态数最多约 $550$，标程每个点只需几毫秒。

总复杂度 $O(nm\cdot|\text{状态}|\cdot m)$，时限 $2\text{s}$ 非常宽松。

## 常见错误

#### 坑 1：封闭检查只在"有上插头"时做
连通块封闭有三种情形：只有左插头、只有上插头、左上都有且合并后。若只在 $U>0$ 时检查，"只有左插头、且 $r=d=0$"这种情形就被漏掉了：既没有剪掉只含 $S$ 或只含 $E$ 的非法状态，也不会置 $\text{done}$。

一个最小反例：

```
3 3
2 2 0
2 1 0
2 1 0
1 2
3 1
```

正确答案为 $1$（路径 $(1,2)\to(1,1)\to(2,1)\to(3,1)$），漏检的写法输出 $0$。样例 1 也能卡掉它。

#### 坑 2：连通块标号最多是 4
"每个连通块至少占 $2$ 个插头"是错误的：一条向下垂着的链在轮廓线上可以只占 $1$ 个插头。$8$ 个插头最多对应 $8$ 个不同连通块，标号需要 $4$ 位，标记位需要 $8\times2=16$ 位。

标号开小时，宽度小于 $7$ 的数据全部正常，只有宽度为 $7$ 的数据才会出错，所以子任务 5 需要放足够多的宽度为 $7$ 的点。

#### 坑 3：转置后忘了交换 $S,E$ 的坐标
$m>n$ 时转置网格，$S,E$ 的坐标也要同时交换。样例中恰好 $n=m$ 或对称的情形不会暴露这个问题。

#### 坑 4：把"成环"当成非法
这不是回路计数题，$L,U$ 在同一连通块时直接合并即可，不要套用"不能成环"的经典写法。

## 标程

*以下代码由出题人独立实现，并已与暴力在随机小数据上对拍。*

```cpp
// 独立实现：轮廓线(broken profile)插头DP，状态 = m+1 个插头的连通块标号 + 每块的 S/E 标记 + done
#include <bits/stdc++.h>
using namespace std;
typedef unsigned long long ull;
const int MOD = 998244353;
int n, m;

static inline ull encode(const int *lab, const int *tg, int done) {
    int mp[16] = {0}, cnt = 0, ntg[10] = {0};
    ull key = 0;
    for (int k = 0; k <= m; k++) {
        int l = lab[k];
        if (l) {
            if (!mp[l]) { mp[l] = ++cnt; ntg[cnt] = tg[l]; }
            key |= (ull)mp[l] << (4 * k);
        }
    }
    for (int l = 1; l <= cnt; l++) key |= (ull)ntg[l] << (32 + 2 * (l - 1));
    key |= (ull)done << 48;
    return key;
}

int main() {
    int N, M;
    scanf("%d %d", &N, &M);
    vector<vector<int>> A(N, vector<int>(M));
    for (auto &r : A) for (auto &x : r) scanf("%d", &x);
    int sx, sy, ex, ey;
    scanf("%d %d %d %d", &sx, &sy, &ex, &ey);
    sx--; sy--; ex--; ey--;
    if (M > N) {                       // 转置，使列数 <= 行数，即 m=min(N,M)<=7
        vector<vector<int>> B(M, vector<int>(N));
        for (int i = 0; i < N; i++) for (int j = 0; j < M; j++) B[j][i] = A[i][j];
        swap(N, M); A = B; swap(sx, sy); swap(ex, ey);
    }
    n = N; m = M;
    unordered_map<ull, int> cur, nxt;
    cur[0] = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            nxt.clear();
            int need = A[i][j];
            int cellTag = (i == sx && j == sy ? 1 : 0) | (i == ex && j == ey ? 2 : 0);
            for (auto &kv : cur) {
                ull key = kv.first; int val = kv.second;
                int lab0[9], tg0[10] = {0};
                for (int k = 0; k <= m; k++) lab0[k] = (key >> (4 * k)) & 15;
                for (int l = 1; l <= 8; l++) tg0[l] = (key >> (32 + 2 * (l - 1))) & 3;
                int done0 = (key >> 48) & 1;
                int L = lab0[j], U = lab0[j + 1];
                for (int r = 0; r <= (j < m - 1 ? 1 : 0); r++)
                    for (int d = 0; d <= (i < n - 1 ? 1 : 0); d++) {
                        if ((L > 0) + (U > 0) + r + d != need) continue;
                        int lab[9], tg[10];
                        memcpy(lab, lab0, sizeof(lab0)); memcpy(tg, tg0, sizeof(tg0));
                        int done = done0, cl = 0;
                        if (L) cl = L;
                        if (U) {
                            if (!cl) cl = U;
                            else if (U != cl) {
                                int u = U;
                                for (int k = 0; k <= m; k++) if (lab[k] == u) lab[k] = cl;
                                tg[cl] |= tg[u];
                            }
                        }
                        if (!cl) { cl = 9; tg[9] = 0; }
                        tg[cl] |= cellTag;
                        lab[j] = d ? cl : 0;
                        lab[j + 1] = r ? cl : 0;
                        if (!d && !r) {                      // 该连通块可能在此封闭
                            bool found = false;
                            for (int k = 0; k <= m; k++) if (lab[k] == cl) { found = true; break; }
                            if (!found) {
                                int t = tg[cl];
                                if (t == 3) done = 1;
                                else if (t != 0) continue;
                            }
                        }
                        int &ref = nxt[encode(lab, tg, done)];
                        ref += val; if (ref >= MOD) ref -= MOD;
                    }
            }
            swap(cur, nxt);
        }
        nxt.clear();                                         // 行末：轮廓线右移一位
        for (auto &kv : cur) {
            ull key = kv.first;
            int lab0[9], tg0[10] = {0};
            for (int k = 0; k <= m; k++) lab0[k] = (key >> (4 * k)) & 15;
            for (int l = 1; l <= 8; l++) tg0[l] = (key >> (32 + 2 * (l - 1))) & 3;
            if (lab0[m] != 0) continue;
            int lab[9]; lab[0] = 0;
            for (int k = 0; k < m; k++) lab[k + 1] = lab0[k];
            int &ref = nxt[encode(lab, tg0, (key >> 48) & 1)];
            ref += kv.second; if (ref >= MOD) ref -= MOD;
        }
        swap(cur, nxt);
    }
    long long ans = 0;
    for (auto &kv : cur) if ((kv.first >> 48) & 1) ans = (ans + kv.second) % MOD;
    printf("%lld\n", ans);
}
```

## 关于数据

- 子任务 1 的前三个点是样例。
- 非样例的点绝大多数由"先随机开关所有门，再反推出度数矩阵"得到，因此一定存在合法迷宫；$S,E$ 大多选在同一连通块内，使答案非 $0$。
- 每个子任务里放了若干答案为 $0$ 的点：个别度数被改动，或 $S,E$ 被选在不连通的位置。
- 宽度为 $7$ 的点覆盖了开门概率 $0.3\sim0.7$ 的不同密度。
