setcpm(124/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4")

$: note("f6 d6 b5 ~ a5 f6 d6 b5").s("triangle")
  .lpf(4800).release(.15).gain(.3).delay(.4)

$: note("f4 c4 c4 d#4 f4 f4 c4 c4").s("supersaw")
  .velocity(.4).attack(.05).lpf(2000).release(.2).gain(.35)
