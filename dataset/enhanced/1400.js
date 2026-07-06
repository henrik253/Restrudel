setcpm(120/4)

$: s("bd*2 sd").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("e4 e4 f#4 e4").s("gm_piccolo").lpf(2500)
  .release(.2).room(.4).gain(.4)

$: n("<e2 e2 b1 f#2>").scale("e:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
