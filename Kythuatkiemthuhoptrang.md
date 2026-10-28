## 3. Kỹ thuật kiểm thử hộp trắng

### Các phương pháp xây dựng ca kiểm thử

- Phương pháp kiểm thử dòng điều khiển (*control flow testing*)
- Phương pháp kiểm thử dòng dữ liệu (*data flow testing*)

---

### 3.1 Kiểm thử dòng điều khiển

- Dựa trên khái niệm **đồ thị dòng điều khiển** (*control flow graph*).
- Đồ thị dòng điều khiển là một đồ thị có hướng gồm:
  - Các **đỉnh** tương ứng với các câu lệnh / nhóm câu lệnh.
  - Các **cạnh** là các dòng điều khiển giữa các câu lệnh / nhóm câu lệnh.

#### Xây dựng đồ thị dòng điều khiển

**Các thành phần cơ bản của đồ thị:**

*(Hình)* Điểm xuất phát (chấm đen) · Khối xử lý (vòng tròn, 1 mũi tên vào, 1 mũi tên ra) · Điểm quyết định (vòng tròn, 1 vào, 2 ra) · Điểm nối (vòng tròn, 2 vào, 1 ra) · Điểm kết thúc (chấm đen trong vòng tròn).

**Các cấu trúc điều khiển phổ biến:**

*(Hình)* Tuần tự · Rẽ nhánh (`if`) · `switch` · `while c do ...` · `do ... while c`.

#### Ví dụ: xây dựng đồ thị dòng điều khiển

```c
float foo(int a, int b, int c, int d){
1.  float e;
2.  if (a==0)
3.     return 0;
4.  int x = 0;
5.  if ((a==b) || (c==d))
6.     x = 1;
7.  e = 1/x;
8.  return e;
}
```

```mermaid
flowchart TD
    S((" ")) --> N1((1))
    N1 --> N2((2))
    N2 --> N3((3))
    N2 --> N4((4))
    N3 --> E(((End)))
    N4 --> N5((5))
    N5 --> N6((6))
    N5 --> N78((7,8))
    N6 --> N78
    N78 --> E
```

---

#### Các độ đo kiểm thử

- Độ đo kiểm thử là **mức độ bao phủ** của một bộ kiểm thử (tập các ca kiểm thử), được đo bằng tỷ lệ các thành phần thực sự được kiểm thử so với tổng số cần kiểm thử.
- Các thành phần kiểm thử có thể là các câu lệnh, các điểm quyết định, các điều kiện con, các đường thi hành hay sự kết hợp giữa chúng.
- Độ bao phủ càng lớn thì độ tin cậy của bộ kiểm thử càng cao.
- **Mục tiêu:** kiểm thử với số ca tối thiểu nhưng độ bao phủ tối đa.

##### Độ đo kiểm thử cấp 1 – độ đo C1 (phủ câu lệnh)

- Mỗi câu lệnh được thực hiện **ít nhất một lần** sau khi chạy các ca kiểm thử.
- Với hàm `foo` ở trên, cần **2 ca** để đạt 100% độ bao phủ C1:

| TT  | Đầu vào    | Đầu ra mong đợi | Đầu ra thực tế | Ghi chú |
|-----|------------|:---------------:|----------------|---------|
| Tc1 | 0, 1, 2, 3 | 0               |                |         |
| Tc2 | 1, 1, 2, 3 | 1               |                |         |

##### Độ đo kiểm thử cấp 2 – độ đo C2 (phủ nhánh)

- Các điểm quyết định trong đồ thị dòng điều khiển của đơn vị kiểm thử đều được thực hiện ít nhất một lần **cả hai nhánh đúng và sai**.

| Điểm quyết định | Điều kiện tương ứng | Đúng | Sai |
|:---:|---------------------|:----:|:---:|
| 2 | `a==0`                 | Tc1 | Tc2 |
| 5 | `(a==b) \|\| (c==d)`   | Tc2 | Tc3 |

Các ca kiểm thử tương ứng của độ đo C2 với hàm `foo`:

| TT  | Đầu vào    | Đầu ra mong đợi | Đầu ra thực tế | Ghi chú |
|-----|------------|:---------------:|----------------|---------|
| Tc1 | 0, 1, 2, 3 | 0               |                |         |
| Tc2 | 1, 1, 2, 3 | 1               |                |         |
| Tc3 | 1, 2, 1, 2 | Lỗi chia 0      |                |         |

##### Độ đo kiểm thử cấp 3 – độ đo C3 (phủ điều kiện con)

- Các **điều kiện con** thuộc các điều kiện phức tạp tương ứng với các điểm quyết định trong đồ thị dòng điều khiển đều được thực hiện ít nhất một lần cả hai nhánh đúng và sai.

| Điểm quyết định | Điều kiện tương ứng | Đúng | Sai |
|:---:|---------------------|:----:|:---:|
| 2 | `a==0`    | Tc1 | Tc2 |
| 5 | `(a==b)`  | Tc2 | Tc3 |
| 5 | `(c==d)`  | Tc4 | ?   |

Các ca kiểm thử tương ứng của độ đo C3 với hàm `foo`:

| TT  | Đầu vào    | Đầu ra mong đợi | Đầu ra thực tế | Ghi chú |
|-----|------------|:---------------:|----------------|---------|
| Tc1 | 0, 1, 2, 3 | 0               |                |         |
| Tc2 | 1, 1, 2, 3 | 1               |                |         |
| Tc3 | 1, 2, 1, 2 | Lỗi chia 0      |                |         |
| Tc4 | 1, 2, 1, 1 | 1               |                |         |

##### Bài tập

Cho hàm `Grade`:

```c
char Grade(int score){
    int res;
    if(score < 0 || score > 10)
        return 'I';
    if(score>=9)
        res = 'A';
    else
        if(score >=8)
            res ='B';
        else
            if(score >=6.5)
                res = 'C';
            else
                if(score >=5)
                    res = 'D';
                else
                    res = 'F';
    return res;
}
```

- Hãy xây dựng đồ thị dòng điều khiển cho hàm `Grade` ứng với độ đo C1 và C2.
- Hãy sinh các đường đi và các ca kiểm thử với độ đo C1.
- Hãy sinh các đường đi và các ca kiểm thử với độ đo C2.

#### Sinh đường đi

- Bằng cách lập bảng bao gồm các thành phần sẽ qua của các ca kiểm thử.
- Ví dụ: đường đi của độ đo C1 đối với hàm `foo` ở trên như sau:

| TT  | Đường đi          | Đầu vào    | Đầu ra mong đợi | Đầu ra thực tế | Ghi chú |
|-----|-------------------|------------|:---------------:|----------------|---------|
| Tc1 | 1, 2, 3           | 0, 1, 2, 3 | 0               |                |         |
| Tc2 | 1, 2, 4, 5, 6, 7, 8 | 1, 1, 2, 3 | 1             |                |         |

---

#### Kiểm thử vòng lặp

Với mỗi đơn vị chương trình có vòng lặp, cần quan tâm đến ba trường hợp sau:

- **Lệnh lặp đơn giản:** đơn vị chương trình chỉ chứa đúng một vòng lặp (thân của vòng lặp không chứa các vòng lặp khác).
- **Lệnh lặp liền kề:** đơn vị chương trình chỉ chứa các lệnh lặp kế tiếp nhau.
- **Lệnh lặp lồng nhau:** đơn vị chương trình chỉ chứa các vòng lặp chứa các lệnh lặp khác.

##### Xét bài toán

- Xây dựng đồ thị dòng điều khiển ứng với độ đo C3 cho hàm `average`.
- Sinh các đường đi và các ca kiểm thử tương ứng với đồ thị đó.
- Sinh các ca kiểm thử để kiểm thử vòng lặp `while`.

```c
 1 double average (double value[], double min, double max,
 2                int &tcnt, int &vcnt){
 3     double sum = 0;
 4     int i = 1;
 5     tcnt = vcnt = 0;
 6     while (value[i]<> -999 && tcnt <100){
 7         tcnt++;
 8         if(min <= value[i] && value[i] <= max){
 9             sum += value[i];
10             vcnt++;
11         }
12         i++;
13     }
14     if(vcnt >0)
15         return sum/vcnt;
16     return -999;
17 }
```

Đánh số các khối lệnh để dựng đồ thị (độ đo C3 – tách từng điều kiện con):

| Đỉnh | Nội dung |
|:---:|----------|
| 1 | `double sum = 0; int i = 1; tcnt = vcnt = 0;` |
| 2 | `value[i] <> -999` (điều kiện con của `while`) |
| 3 | `tcnt < 100` (điều kiện con của `while`) |
| 4 | `tcnt++;` |
| 5 | `min <= value[i]` (điều kiện con của `if`) |
| 6 | `value[i] <= max` (điều kiện con của `if`) |
| 7 | `sum += value[i]; vcnt++;` |
| 8 | `i++;` |
| 9 | `if (vcnt > 0)` |
| 10 | `return sum/vcnt;` |
| 11 | `return -999;` |

```mermaid
flowchart TD
    S((" ")) --> N1((1))
    N1 --> N2((2))
    N2 --> N3((3))
    N2 --> N9((9))
    N3 --> N4((4))
    N3 --> N9
    N4 --> N5((5))
    N5 --> N6((6))
    N5 --> N8((8))
    N6 --> N7((7))
    N6 --> N8
    N7 --> N8
    N8 --> N2
    N9 --> N10((10))
    N9 --> N11((11))
    N10 --> E(((End)))
    N11 --> E
```

##### Đường đi và ca kiểm thử tương ứng với độ đo C3

| ID  | Test Path                     | Inputs          | EO  | RO | Note |
|-----|-------------------------------|-----------------|:---:|----|------|
| tc1 | 1; 2; 9; 10                   |                 |     |    | tc6  |
| tc2 | 1; 2; 9; 11                   | [-999, ...], 1, 2 | -999 |  |      |
| tc3 | 1; 2; 3; 9; 10                |                 |     |    | tc6  |
| tc4 | 1; 2; 3; 4; 5; 8; 2; 9; 11    | [0,-999], 1, 2  | -999 |    |      |
| tc5 | 1; 2; 3; 4; 5; 6; 8; 2; 9; 11 | [3,-999], 1, 2  | -999 |    |      |
| tc6 | 1; 2; 3; 4; 5; 6; 7; 8; 2; 9; 10 | [1,-999], 1, 2 | 1  |    |      |

*(EO = Expected Output – đầu ra mong đợi; RO = Real Output – đầu ra thực tế.)*

> Với các đường đi trên, vòng lặp `while` của hàm `average` chỉ được thực hiện **tối đa một lần lặp** nên rất khó để phát hiện các lỗi tiềm ẩn (có thể có) bên trong vòng lặp này.

##### Kiểm thử vòng lặp while

Để thực hiện kiểm thử vòng lặp, cần sinh thêm các ca kiểm thử ứng với một số trường hợp sau:

1. Vòng lặp thực hiện 0 lần
2. Vòng lặp thực hiện 1 lần
3. Vòng lặp thực hiện 2 lần
4. Vòng lặp thực hiện k lần, 2 < k < n − 1, với n là số lần lặp tối đa của vòng lặp
5. Vòng lặp thực hiện n − 1 lần
6. Vòng lặp thực hiện n lần
7. Vòng lặp thực hiện n + 1 lần

Các ca kiểm thử cho vòng lặp `while`:

| ID       | Số lần lặp | Inputs               | EO   | RO | Note |
|----------|:----------:|----------------------|:----:|----|------|
| tcl0     | 0   | [-999, ...], 1, 2        | -999 |    |      |
| tcl1     | 1   | [1,-999], 1, 2           | 1    |    |      |
| tcl2     | 2   | [1,2,-999], 1, 2         | 1.5  |    |      |
| tclk     | 5   | [1,2,3,4,5,-999], 1, 10  | 3    |    |      |
| tcl(n-1) | 99  | [1,2,...,99,-999], 1, 100 | 50  |    |      |
| tcln     | 100 | [1,2,...,100], 1, 2      | 50.5 |    |      |
| tcl(n+1) |     |                      |      |    |      |

#### Ôn tập

- Các phương pháp xây dựng ca kiểm thử **hộp đen** ⇒ xác định được số testcase tối thiểu.
- Các phương pháp xây dựng ca kiểm thử **hộp trắng** ⇒ xác định được đường đi để phủ một độ đo nào đó ⇒ dữ liệu đầu vào, đầu ra tương ứng cho từng đường đi.

---

### 3.2 Kiểm thử dòng dữ liệu

- Là kiểm thử chú trọng vào **các biến** trong đơn vị chương trình.
- Kiểm thử dòng dữ liệu được chia làm 2 loại:
  - Kiểm thử dựa trên việc gán và sử dụng các biến
  - Kiểm thử dựa trên lát cắt

#### Kiểm thử dựa trên việc gán và sử dụng các biến

- Mỗi chương trình/đơn vị chương trình là chuỗi các hoạt động gồm nhận các giá trị đầu vào, thực hiện các tính toán, gán giá trị mới cho các biến (các biến cục bộ và toàn cục) và cuối cùng là trả lại kết quả đầu ra như mong muốn.
- Khi một biến được khai báo và gán giá trị, nó phải được sử dụng ở đâu đó trong chương trình.
- Việc sử dụng biến này có thể trong các câu lệnh tính toán hoặc trong các biểu thức điều kiện.
- Nếu biến này không được sử dụng ở các câu lệnh tiếp theo thì việc khai báo biến này là không cần thiết.

#### Các vấn đề phổ biến về dòng dữ liệu

**Loại 1 – Gán giá trị rồi gán tiếp giá trị:**
Ví dụ, hai câu lệnh tuần tự `x = f1(y); x = f2(z);`

Xem xét các tình huống sau:

- Khi câu lệnh thứ hai được thực hiện, giá trị của biến `x` được gán lại và câu lệnh đầu không có ý nghĩa.
- Lập trình viên có thể có nhầm lẫn ở câu lệnh đầu. Câu lệnh này có thể là gán giá trị cho một biến khác như là `w = f1(y)`.
- Có thể có nhầm lẫn ở câu lệnh thứ hai. Lập trình viên định gán giá trị cho một biến khác như là `w = f2(z)`.
- Một hoặc một số câu lệnh giữa hai câu lệnh này bị thiếu. Ví dụ như câu lệnh `w = f3(x)`.

**Loại 2 – Chưa gán giá trị nhưng được sử dụng:**
Ví dụ, ba câu lệnh tuần tự: `y = f(x1); int z; x = y + z;`

Trong trường hợp này, biến `z` chưa được gán giá trị khởi tạo nhưng đã được sử dụng trong câu lệnh để tính giá trị của biến `x` (`x = y + z`). Vấn đề này có thể được lý giải theo các tình huống sau:

- Lập trình viên có thể bỏ quên lệnh gán giá trị cho biến `z` trước câu lệnh tính toán giá trị cho biến `x`.
- Có thể có sự nhầm lẫn giữa biến `z` với một biến đã được khai báo và gán giá trị.

**Loại 3 – Đã được khai báo và gán giá trị nhưng không được sử dụng:**
Nếu một biến đã được khai báo và gán giá trị nhưng không hề được sử dụng. Các tình huống sau có thể được sử dụng để lý giải cho vấn đề này:

- Có sự nhầm lẫn giữa biến này và một số biến khác được sử dụng trong chương trình. Trong thiết kế, biến này được sử dụng nhưng nó đã bị thay thế (do nhầm lẫn) bởi một biến khác.
- Biến này thực sự không được sử dụng trong chương trình. Lúc đầu lập trình viên định sử dụng nó như là một biến tạm thời hoặc biến trung gian nhưng sau đó lại không cần dùng. Lập trình viên này đã quên xóa các câu lệnh khai báo và gán giá trị cho biến này.

#### Sơ đồ chuyển trạng thái để xác định bất thường trong việc sử dụng biến

**Các trạng thái:**

- **U:** biến chưa được gán giá trị
- **D:** biến đã được gán giá trị nhưng chưa được sử dụng
- **R:** biến đã được sử dụng
- **A:** trạng thái lỗi

**Các hành động:**

- **d:** biến được gán giá trị
- **r:** biến được sử dụng
- **u:** biến chưa được gán giá trị hoặc được khai báo lại và chưa được gán giá trị

```mermaid
stateDiagram-v2
    U --> U : u
    U --> D : d
    U --> A : r
    D --> R : r
    D --> A : d, u
    R --> D : d
    R --> U : u
    R --> R : r
    A --> A : d, u, r
```

#### Kiểm thử dòng dữ liệu động

- Cần chắc chắn rằng một biến phải được gán đúng giá trị, tức là phải xác định được một đường đi của biến từ một điểm bắt đầu nơi nó được định nghĩa đến điểm mà biến đó được sử dụng.
- Nếu chưa có các ca kiểm thử để kiểm tra đường đi này, không thể tự tin khẳng định là biến này đã được gán giá trị đúng.
- Ngay cả khi gán đúng giá trị cho biến thì các giá trị được sinh ra chưa chắc đã chính xác do tính toán hoặc các biểu thức điều kiện sai (biến được sử dụng sai).

**Các bước để kiểm thử dòng dữ liệu động:**

1. Xây dựng đồ thị dòng dữ liệu của chương trình/đơn vị chương trình.
2. Chọn một hoặc một số tiêu chí kiểm thử dòng dữ liệu.
3. Xác định các đường dẫn chương trình phù hợp với tiêu chí kiểm thử đã chọn.
4. Lấy ra các biểu thức điều kiện từ tập các đường đi, thực hiện giải các biểu thức điều kiện để có được các giá trị đầu vào cho các ca kiểm thử tương ứng với các đường đi này và tính toán giá trị đầu ra mong đợi của mỗi ca kiểm thử.
5. Thực hiện các ca kiểm thử để xác định các lỗi (có thể có) của chương trình.
6. Sửa các lỗi (nếu có) và thực hiện lại tất cả các ca kiểm thử trong trường hợp bước trên phát hiện ra lỗi.

#### Xây dựng đồ thị dòng dữ liệu

Xét ví dụ:

```c
int VarTypes(int x, int y){
1.  int i;
2.  int *iptr;
3.  i = x;
4.  iptr = malloc(sizeof(int));
5.  *iptr = i + x;
6.  if (*iptr > y)
7.      return (x);
8.  else {
9.      iptr = malloc(sizeof(int));
10.     *iptr = x + y;
11.     return(*iptr);
12. }//end if
}//the end
```

#### Các khái niệm liên quan đến việc định nghĩa và sử dụng biến

- **Định nghĩa 1 (Định nghĩa của một biến – *def*).** Một câu lệnh thực hiện việc gán giá trị cho một biến được gọi là câu lệnh định nghĩa của biến đó.
  Như trong hàm `VarTypes`: câu lệnh `i = x` (dòng 3) là một ví dụ về việc định nghĩa của biến `i`.

- **Định nghĩa 2 (Chưa định nghĩa một biến – *undef*).** Một câu lệnh khai báo một biến nhưng chưa thực hiện việc gán giá trị được gọi là *undef* với biến đó.
  Trong hàm `VarTypes`:
  - Câu lệnh `iptr = malloc(sizeof(int));` (dòng 4) là một ví dụ về việc chưa định nghĩa biến `iptr`.
  - Câu lệnh tiếp theo `*iptr = i + x;` (dòng 5) là một định nghĩa của biến này.

- **Định nghĩa 3 (Biến được sử dụng – *use*).** Một câu lệnh sử dụng một biến (để tính toán hoặc để kiểm tra các điều kiện) được gọi là *use* của biến đó. *use* được chia làm 2 loại: **c-use** và **p-use**.

- **Định nghĩa 4 (Biến được sử dụng để tính toán – *c-use*).** Một câu lệnh sử dụng một biến để tính toán giá trị của một biến khác được gọi là *c-use* với biến đó.
  Ví dụ, trong hàm `VarTypes`, câu lệnh `*iptr = i + x;` (dòng 5) là *c-use* ứng với biến `i` và biến `x`.

- **Định nghĩa 5 (Biến được sử dụng để kiểm tra các điều kiện – *p-use*).** Một câu lệnh sử dụng một biến trong các biểu thức điều kiện (câu lệnh rẽ nhánh, lặp, …) được gọi là *p-use* với biến đó.
  Ví dụ, trong hàm `VarTypes`, câu lệnh `if (*iptr > y) ...` (dòng 6) là *p-use* ứng với biến `iptr` và biến `y`.

- **Định nghĩa 6 (Đồ thị dòng dữ liệu).** Đồ thị dòng dữ liệu của một chương trình/đơn vị chương trình là một đồ thị có hướng **G = ⟨N, E⟩**, với:
  - **N** là tập các đỉnh tương ứng với các câu lệnh *def* hoặc *c-use* của các biến được sử dụng trong đơn vị chương trình. Đồ thị G có hai đỉnh đặc biệt là đỉnh bắt đầu (tương ứng với lệnh *def* của các biến tham số) và đỉnh kết thúc đơn vị chương trình.
  - **E** là tập các cạnh tương ứng với các câu lệnh *p-use* của các biến.

#### Xây dựng đồ thị dòng dữ liệu cho hàm `ReturnAverage`

```c
 1 double ReturnAverage(int value[], int AS, int MIN, int MAX){
 2     int i, ti, tv, sum;
       double av;
 3     i = 0; ti = 0; tv = 0; sum = 0;
 4     while (ti < AS && value[i] != -999) {
 5         ti++;
 6         if (value[i] >= MIN && value[i] <= MAX) {
 7             tv++;
               sum = sum + value[i];
           }
 8         i++;
       }//end while
 9     if (tv > 0)
10         av = (double)sum/tv;
       else
11         av = (double) -999;
12     return (av);
   } //the end
```

**Đồ thị dòng dữ liệu của hàm `ReturnAverage`** (theo hình trên slide):

```mermaid
flowchart TD
    N1["1: Khởi tạo các biến: value[], AS, MIN, MAX"] -->|true| N2["2: Khai báo các biến: i, ti, tv, sum, av"]
    N2 -->|true| N3["3: Khởi tạo: i=0, ti=0, tv=0, sum=0"]
    N3 -->|true| N4["4: NULL"]
    N4 -->|"~((ti < AS) && (value[i] != -999))"| N9["9: NULL"]
    N4 -->|"(ti < AS) && (value[i] != -999)"| N5["5: ti++"]
    N5 -->|true| N6["6: NULL"]
    N6 -->|"~((value[i] >= MIN) && (value[i] != MAX))"| N8["8: i++"]
    N6 -->|"(value[i] >= MIN) && (value[i] != MAX)"| N7["7: tv++; sum = sum + value[i]"]
    N7 -->|true| N8
    N8 -->|true| N4
    N9 -->|"~(tv > 0)"| N11["11: av = (double) -999"]
    N9 -->|"(tv > 0)"| N10["10: av = (double) sum/tv"]
    N10 -->|true| N12["12: return av;"]
    N11 -->|true| N12
```

> **Ghi chú của người chuyển đổi:** Cách đánh số đỉnh ở hình trên (12 đỉnh, đỉnh 4–9 là các điểm quyết định) **không trùng** với cách đánh số trong *Bảng 1*, *Bảng 2* và các ví dụ đường đi bên dưới (đỉnh 1–10, ví dụ đỉnh 3 là điểm kiểm tra `while`, đỉnh 7 là điểm rẽ `tv > 0`). Phần dưới đây giữ nguyên như slide gốc; khi làm bài nên dựa vào Bảng 1 và Bảng 2.

#### Các khái niệm về dòng dữ liệu (tiếp)

- **Định nghĩa 7 (Global c-use).** Giả sử biến `x` được sử dụng để tính toán (*c-use*) tại đỉnh `i` của đồ thị dòng dữ liệu. Việc sử dụng biến `x` tại đỉnh `i` được gọi là **Global c-use** nếu `x` đã được định nghĩa ở các đỉnh trước đó.
  *Ví dụ:* Trong đồ thị dòng dữ liệu của hàm, việc sử dụng biến `tv` tại đỉnh 9 là Global c-use vì biến này đã được định nghĩa tại các đỉnh 2 và 5.

- **Định nghĩa 8 (Def-clear path).** Giả sử biến `x` được định nghĩa (*def*) tại đỉnh `i` và được sử dụng tại đỉnh `j`. Một đường đi từ `i` đến `j` ký hiệu là `(i - n1 - ... - nm - j)` với m ≥ 0 được gọi là **Def-clear path** ứng với biến `x` nếu biến này không được định nghĩa tại các đỉnh từ `n1` đến `nm`.
  *Ví dụ:* đường đi `(2 - 3 - 4 - 5)` là một Def-clear path ứng với biến `tv` vì biến này được định nghĩa tại đỉnh 2, được sử dụng tại đỉnh 5, và không được định nghĩa tại các đỉnh 3 và 4. Tương tự, đường đi `(2 - 3 - 4 - 6 - 3 - 4 - 6 - 3 - 4 - 5)` cũng là một Def-clear path ứng với biến `tv`.

- **Định nghĩa 9 (Global def).** Một đỉnh `i` được gọi là **Global def** của biến `x` nếu đỉnh này định nghĩa biến `x` (*def*) và có một Def-clear path của `x` từ đỉnh `i` tới đỉnh chứa một Global c-use hoặc cạnh chứa một p-use của biến này.

  Bảng 1 liệt kê tất cả các Global def và Global c-use xuất hiện trong đồ thị dòng dữ liệu. Trong bảng này, `def(i)` chỉ tập các biến có Global def tại đỉnh `i`; tương tự, `c-use(i)` chỉ tập các biến có Global c-use tại đỉnh `i`. Tất cả các điều kiện ứng với các cạnh và các p-use xuất hiện trong đồ thị dòng dữ liệu cũng được liệt kê trong Bảng 2, với `p-use(i, j)` là tập các biến có p-use tại cạnh `(i, j)`.

**Bảng 1 – `def()` và `c-use()` của các đỉnh**

| Đỉnh *i* | def(*i*)               | c-use(*i*)               |
|:--------:|------------------------|--------------------------|
| 1  | {value, AS, MIN, MAX} | {} |
| 2  | {i, ti, tv, sum}      | {} |
| 3  | {}                    | {} |
| 4  | {ti}                  | {ti} |
| 5  | {tv, sum}             | {tv, i, sum, value} |
| 6  | {i}                   | {i} |
| 7  | {}                    | {} |
| 8  | {av}                  | {} |
| 9  | {av}                  | {sum, tv} |
| 10 | {}                    | {av} |

**Bảng 2 – Các điều kiện và p-use của các cạnh**

| (*i*, *j*) | Điều kiện tại cạnh (*i*, *j*) | p-use(*i*, *j*) |
|:---:|-------------------------------|-----------------|
| (1, 2)  | True | {} |
| (2, 3)  | True | {} |
| (3, 4)  | `(ti<AS) && (value[i] != -999)` | {i, ti, AS, value} |
| (4, 5)  | `(value[i]>=MIN) && (value[i]<=MAX)` | {i, MIN, MAX, value} |
| (4, 6)  | `~((value[i]>=MIN) && (value[i]<=MAX))` | {i, MIN, MAX, value} |
| (5, 6)  | True | {} |
| (6, 3)  | True | {} |
| (3, 7)  | `~((ti<AS) && (value[i] != -999))` | {i, ti, AS, value} |
| (7, 8)  | `~(tv > 0)` | {tv} |
| (7, 9)  | `(tv > 0)` | {tv} |
| (8, 10) | True | {} |
| (9, 10) | True | {} |

- **Định nghĩa 10 (Simple path).** Một đường đi trong đồ thị dòng dữ liệu được gọi là **Simple path** nếu các đỉnh chỉ xuất hiện đúng một lần, trừ đỉnh đầu và đỉnh cuối.
  *Ví dụ:* Trong đồ thị của hàm `ReturnAverage`, các đường đi `(2 - 3 - 4 - 5)` và `(3 - 4 - 6 - 3)` là các Simple path.

- **Định nghĩa 11 (Loop-free path).** Một đường đi trong đồ thị dòng dữ liệu được gọi là **Loop-free path** nếu các đỉnh chỉ xuất hiện đúng một lần.

- **Định nghĩa 12 (Complete-path).** Một đường đi được gọi là **Complete-path** nếu nó có điểm bắt đầu và điểm kết thúc chính là điểm bắt đầu và điểm kết thúc của đồ thị dòng dữ liệu.

- **Định nghĩa 13 (Du-path).** Một đường đi `(n1 - n2 - ... - nj - nk)` được gọi là **Du-path** (*definition-use path*) ứng với biến `x` nếu đỉnh `n1` là Global def của biến `x` và:
  - Đỉnh `nk` có một Global c-use với biến `x` và `(n1 - n2 - ... - nj - nk)` là một Def-clear simple path với biến `x`, **hoặc**
  - Cạnh `(nj, nk)` có p-use với biến `x` và `(n1 - n2 - ... - nj)` là Def-clear loop-free path với biến này.

**Ví dụ** trong đồ thị dòng dữ liệu của hàm `ReturnAverage`:

- Đường đi `(2 - 3 - 4 - 5)` là một Du-path ứng với biến `tv` vì đỉnh 2 là Global def của biến `tv`, đỉnh 5 có Global c-use với biến này.
- Đường đi `(2 - 3 - 4 - 5)` là một Def-clear simple path với biến `tv`.
- Đường đi `(2 - 3 - 7 - 9)` cũng là một Du-path ứng với biến `tv` vì đỉnh 2 là Global def của biến này, cạnh `(7, 9)` có p-use với biến `tv`.
- Đường đi `(2 - 3 - 7)` là một Def-clear loop-free path với `tv`.

---

#### Các độ đo cho kiểm thử dòng dữ liệu

- **All-defs:** tương ứng với tất cả các đường đi
- **All-c-uses:** đường đi qua tất cả các đỉnh
- **All-p-uses:** đường đi qua tất cả các cạnh

##### Độ đo All-defs

Với mỗi biến `x ∈ V` và mỗi đỉnh `i ∈ N`, giả sử `x` có một Global def tại `i`, chọn một Complete-path chứa một Def-clear path từ đỉnh `i` tới đỉnh `j` sao cho tại `j` có chứa một Global c-use của `x`, hoặc cạnh `(j, k)` chứa một p-use của biến `x`.

*Ví dụ:* Biến `tv` có hai Global def tại các đỉnh 2 và 5, có một Global c-use của biến `tv` tại đỉnh 5 và tồn tại một Def-clear path `(2 - 3 - 4 - 5)` từ đỉnh 2 tới đỉnh 5. Đồng thời tồn tại một Complete-path `(1 – 2 – 3 – 4 – 5 – 6 – 3 – 7 – 9 – 10)` chứa đường đi này. Do vậy đường đi `(2 - 3 - 4 - 5)` thỏa mãn độ đo All-defs.

##### Độ đo All-c-uses

Với mỗi biến `x` và mỗi đỉnh `i` sao cho `i` là Global def với biến `x`, chọn các Complete-path bao gồm các Def-clear path từ đỉnh `i` tới **tất cả** các đỉnh `j` sao cho `j` là Global c-use của `x`.

*Ví dụ:* Tìm tất cả các đường đi thỏa mãn độ đo All-c-uses ứng với biến `ti`.

- Có 2 Global def của biến này tại các đỉnh 2 và 4. Với đỉnh 2, có một Global c-use của biến `ti` tại đỉnh 4 ứng với Def-clear path là `(2 - 3 - 4)`. Tuy nhiên, với Global def của biến này tại đỉnh 4, ta không tìm thấy Global c-use nào của biến `ti`.
- Có thể sử dụng một trong 4 Complete-path sau để đảm bảo độ đo này với biến `ti`:
  - `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 8 - 10)`
  - `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 9 - 10)`
  - `(1 - 2 - 3 - 4 - 6 - 3 - 7 - 8 - 10)`
  - `(1 - 2 - 3 - 4 - 6 - 3 - 7 - 9 - 10)`
- Để quá trình kiểm thử dòng dữ liệu thỏa mãn độ đo All-c-uses, cần tiến hành một cách tương tự với các biến còn lại (`i`, `tv` và `sum`).

##### Độ đo All-p-uses

Với mỗi biến `x` và mỗi đỉnh `i` sao cho `i` là Global def với biến `x`, chọn các Complete-path bao gồm các Def-clear path từ đỉnh `i` tới **tất cả** các cạnh `(j, k)` sao cho có một p-use của `x` tại cạnh này.

*Ví dụ:* Tìm tất cả các đường đi thỏa mãn độ đo All-p-uses ứng với biến `tv`.

- Có 2 Global def tại các đỉnh 2 và 5. Tại đỉnh 2, ta có hai p-use của biến này tại các cạnh `(7, 8)` và `(7, 9)`.
- Đường đi `(2 - 3 - 7 - 8)` là một Def-clear path của `tv` từ đỉnh 2 đến cạnh `(7, 8)`.
- Đường đi `(2 - 3 - 7 - 9)` là một Def-clear path của `tv` từ đỉnh 2 đến cạnh `(7, 9)`.
- Đường đi `(5 - 6 - 3 - 7 - 8)` là một Def-clear path của `tv` từ đỉnh 5 đến cạnh `(7, 8)`.
- Đường đi `(5 - 6 - 3 - 7 - 9)` là một Def-clear path của `tv` từ đỉnh 5 đến cạnh `(7, 9)`.
- Có thể sử dụng một trong 4 Complete-path sau để đảm bảo độ đo này với biến `tv`:
  - `(1 - 2 - 3 - 7 - 8 - 10)`
  - `(1 - 2 - 3 - 7 - 9 - 10)`
  - `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 8 - 10)`
  - `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 9 - 10)`

##### Độ đo All-p-uses/Some c-uses

**Some-c-uses:** Với mỗi biến `x` và mỗi đỉnh `i` sao cho `i` là Global def với biến `x`, chọn các Complete-path bao gồm các Def-clear path từ đỉnh `i` tới **một số** đỉnh `j` sao cho `j` là Global c-use của `x`.

*Ví dụ:* Tìm tất cả các đường đi thỏa mãn độ đo All-p-uses/Some c-uses ứng với biến `i`.

- Biến `i` có hai Global def tại các đỉnh 2 và đỉnh 6.
- Trong khi không có p-use của biến này.
- Vậy, cần tìm đến độ đo Some-c-uses của biến `i`.
- Tại đỉnh 2, có một Global c-use của `i` tại đỉnh 6 và có một Def-clear path `(2 - 3 - 4 - 5 - 6)`.

⇒ Để thỏa mãn độ đo All-p-uses/Some-c-uses với biến `i`, cần chọn Complete-path `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 9 - 10)` chứa đường đi trên.

##### Độ đo All-c-uses/Some-p-uses

**Some-p-uses:** Với mỗi biến `x` và mỗi đỉnh `i` sao cho `i` là Global def với biến `x`, chọn các Complete-path bao gồm các Def-clear path từ đỉnh `i` tới **một số** cạnh `(j, k)` sao cho có một p-use của `x` tại cạnh này.

*Ví dụ:* Tìm tất cả các đường đi thỏa mãn độ đo All-c-uses/Some p-uses ứng với biến `AS`.

- Biến `AS` chỉ có một Global def tại đỉnh 1.
- Không có Global c-use.
- Vậy cần tính theo độ đo Some-p-uses của biến `AS`.
- Từ đỉnh 1, có các p-use của `AS` tại các cạnh `(3, 7)` và `(3, 4)` và có các Def-clear path tương ứng với hai cạnh này là `(1 - 2 - 3 - 7)` và `(1 - 2 - 3 - 4)`. Có rất nhiều Complete-path chứa hai đường đi này. Ví dụ `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 9 - 10)`.

##### Độ đo All-uses

Độ đo này bao gồm các đường đi được sinh ra từ các độ đo **All-p-uses** và **All-c-uses**. Điều này có nghĩa là với mỗi việc sử dụng (c-use hoặc p-use) của một biến thì có một đường đi từ định nghĩa (def) của biến đó tới các đỉnh hoặc các cạnh sử dụng nó.

##### Độ đo All-du-paths

Với mỗi biến `x` và mỗi đỉnh `i` sao cho `i` là Global def với biến `x`, chọn các Complete-path chứa **tất cả các Du-path** từ đỉnh `i` tới:

- Tất cả các đỉnh `j` sao cho có một Global c-use của biến `x` tại `j`.
- Tất cả các cạnh `(j, k)` sao cho có một p-use của biến `x` tại `(j, k)`.

---

#### So sánh các độ đo của kiểm thử dòng dữ liệu

- **Mối quan hệ bao gồm:** Cho hai độ đo c1 và c2, ta nói c1 *bao gồm* c2 nếu mọi đường đi đầy đủ (Complete-path) sinh ra từ đồ thị dòng dữ liệu thỏa mãn c1 thì cũng thỏa mãn c2.
- **Mối quan hệ bao gồm chặt:** Cho hai độ đo c1 và c2, ta nói c1 *bao gồm chặt* c2, ký hiệu là **c1 → c2**, nếu c1 bao gồm c2 và tồn tại một số đường đi đầy đủ sinh ra từ đồ thị dòng dữ liệu thỏa mãn c2 nhưng không thỏa mãn c1.

Mối quan hệ giữa các độ đo của kiểm thử dòng dữ liệu:

```mermaid
flowchart TD
    AP[All-paths] --> ADP[All-du-paths]
    ADP --> AU[All-uses]
    AU --> ACPS["All-c-uses/Some-p-uses"]
    AU --> APSC["All-p-uses/Some-c-uses"]
    ACPS --> AC[All-c-uses]
    ACPS --> AD[All-defs]
    APSC --> AD
    APSC --> APU[All-p-uses]
    APU --> AB[All-branches]
    AB --> AS[All-statements]
```

#### Sinh các ca kiểm thử

- Sinh đồ thị kiểm thử dòng dữ liệu.
- Với độ đo kiểm thử C, cần xác định đường đi thực thi được từ các đường đi đầy đủ thỏa mãn độ đo này.
- Trong đó, đường đi thực thi được là đường đi từ một bộ dữ liệu đầu vào thỏa mãn để thực hiện chương trình.

⇒ Cần xác định bộ dữ liệu đầu vào cho các đường đi thực thi được.

*Ví dụ:* Xét đường đi đầy đủ `(1 - 2 - 3 - 4 - 5 - 6 - 3 - 7 - 9)` từ đồ thị dòng dữ liệu. Từ đó xác định các biểu thức thuộc các p-use nằm trên các cạnh của nó:

- `((ti<AS) && (value[i] != -999))` (cạnh `(3, 4)`)
- `((value[i] >= MIN) && (value[i] <= MAX))` (cạnh `(4, 5)`)
- `~((ti<AS) && (value[i] != -999))` (cạnh `(3, 7)`)
- `(tv > 0)` (cạnh `(7, 9)`)

⇒ Cần sinh ra các bộ giá trị đầu vào thỏa mãn các điều kiện trên (ví dụ: bộ `([1, -999], 2, 1, 2)`).

#### Mối quan hệ bao gồm chặt giữa các độ đo dòng dữ liệu thực thi được

*(Dấu `*` chỉ độ đo ở dạng "thực thi được".)*

```mermaid
flowchart TD
    AP["(All-paths)*"] --> ADP["(All-du-paths)*"]
    AP --> AU["(All-uses)*"]
    AP --> AB["(All-branches)*"]
    AB --> AST["(All-statements)*"]
    AU --> ACPS["(All-c-uses/Some-p-uses)*"]
    AU --> APSC["(All-p-uses/Some-c-uses)*"]
    ACPS --> AC["(All-c-uses)*"]
    ACPS --> AD["(All-defs)*"]
    APSC --> AD
    APSC --> APU["(All-p-uses)*"]
```