17. const errors = []; const value = unit || {};
    // unitName
18. if (typeof unitName !== 'string' || unitName.trim() === '')   19. push 'Vui lòng nhập tên đơn vị'
20. else if (/[\p{Cc}]/u.test(unitName))                          21. push 'Thông tin không đúng định dạng'
22. else if (characterCount(unitName) > 100)                      23. push 'không vượt quá 100 ký tự'
    // unitCode
24. if (không phải chuỗi hoặc rỗng)                               25. push 'Vui lòng nhập mã đơn vị'
26. else if (characterCount(unitCode) > 20)                       27. push 'Mã đơn vị không được vượt quá 20 ký tự'
28. else if (!/^[a-zA-Z0-9_-]+$/.test(unitCode))                  29. push 'Mã đơn vị không đúng định dạng'
    // unitType
30. if (không phải chuỗi hoặc rỗng)                               31. push 'Vui lòng chọn loại đơn vị'
32. else if (!UNIT_TYPES.has(unitType))                           33. push 'Loại đơn vị không hợp lệ'
    // email
34. if (không phải chuỗi hoặc rỗng)                               35. push 'Vui lòng nhập email'
36. else if (characterCount(email) > 100)                         37. push 'Email không được vượt quá 100 ký tự'
38. else if (/\s/.test(email) || !regexEmail.test(email))         39. push 'Email không đúng định dạng'
    // phone
40. if (không phải chuỗi hoặc rỗng)                               41. push 'Vui lòng nhập số điện thoại'
42. else if (!/^0\d{9}$/.test(phone))                             43. push 'Số điện thoại không đúng định dạng'
    // website
44. if (website !== undefined && website !== '') {
45.   if (không phải chuỗi || rỗng || có khoảng trắng)            46. push 'Vui lòng nhập địa chỉ website'
47.   else if (characterCount(website) > 2048)                    48. push 'Địa chỉ website không được vượt quá 2048 ký tự'
49.   else if (!isHttpUrl(website))                               50. push 'Địa chỉ website không đúng định dạng'
    }
    // address
51. if (address !== undefined && address !== '') {
52.   if (không phải chuỗi || rỗng)                               53. push 'Vui lòng nhập địa chỉ'
54.   else if (characterCount(address) > 200)                     55. push 'Địa chỉ không được vượt quá 200 ký tự'
    }
    // parentUnitId
56. if (parentUnitId !== undefined && parentUnitId !== null && (không phải số nguyên || parentUnitId <= 0))
    57. push 'Vui lòng chọn đơn vị cha hợp lệ'
58. return errors;

59. const url = new URL(value);                  // isHttpUrl
60. return (http/https) && Boolean(hostname);
61. return false;                                // catch của isHttpUrl
62. return Array.from(value).length;             // characterCount
