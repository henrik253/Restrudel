setcpm(128/4)

$: s("bd*4 ~ hh hh hh").bank("RolandTR909").gain(.8)

$: s("hh*8 rim").gain(.2)

$: note("b3@2 f3@2").s("sawtooth")
  .lpf(1300).room(.6).release(.2).gain(.4)

$: note("<b1 f1 g1 c2>").s("square")
  .lpf(600).release(.4).gain(.5)
