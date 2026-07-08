setcpm(126/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").gain(.82)

$: s("~ rim ~ rim").bank("RolandTR909").gain(.5)

$: s("hh*8").gain("[.2 .12]*4").pan(.45)

$: note("a5 f5 g5 f5").s("sawtooth")
  .lpf("<600 800 1000 1200>").release(.1).gain(.4)

$: note("b2 d#3 c#3 g#2").s("square")
  .lpf(700).release(.2).gain(.5)
