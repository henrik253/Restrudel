setcpm(112/4)

$: s("bd bd sd bd").bank("RolandTR909").gain(.8)

$: s("hh*8").gain("[.2 .13]*4")

$: note("g#4@2 g#4").s("triangle").lpf(2000)
  .release(.3).room(.3).gain(.4)

$: note("g#2 d#2 g#2 f#2").s("sawtooth").lpf(700)
  .release(.2).gain(.45)
