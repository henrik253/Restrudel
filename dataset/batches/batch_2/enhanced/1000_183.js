setcpm(100/4)

$: note("e1 ~").sound("bd sd").gain(.8)

$: s("hh*4").slow(2).gain(.2)

$: note("c5 c#5").sound("triangle").lpf(644).gain(.35).room(.3)

$: note("c3 ~ e3 ~").sound("piano").lpf(1200).gain(.3)
