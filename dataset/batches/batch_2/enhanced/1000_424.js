setcpm(96/4)
$: s("bd*4").struct("x*4").gain(.7)
$: note("b2 d2 g2 bb2").s("triangle").gain(.35)
$: note(0).sound("sine").lpf(3500).gain(.3).room(.8)
