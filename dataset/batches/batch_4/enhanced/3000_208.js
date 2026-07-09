setcpm(100)

$: s("kick 1").fast(2).bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2)

$: note("e3 c3@2 ~ g#3").sound("sine ~").lpf(2000).velocity(.1799).gain(.4)
