setcpm(100)

$: note("e4 g4 c5 g3 b3 d4 g4 a3 c4 e4 a4 f3 a3 c4 f4 c4 e4 g4 c5 g3 b3 d4 g4 a3 c4 e4 a4 f3 a3 c4").s("gtr xylo").lpf(1500).gain(.4)

$: s("hh*8").gain(.2)

$: s("bd*2 ~ sd bd").lpf(5000).room(.8218).gain(.3).release(2).bank("RolandTR909")
