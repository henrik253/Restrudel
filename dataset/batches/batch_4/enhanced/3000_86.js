setcpm(60/4)

$: s("bd:1 ~ sd:1 ~").gain(.8)

$: s("hh*8").bank("RolandTR909").gain(.25)


$: n("0 [3 7]").scale("c4:major").s("sine").gain(.25).lpf(3000).release(.5)
