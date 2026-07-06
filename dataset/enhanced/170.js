setcpm(118/4)

$: s("~ bd*2 ~ bd*2").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.16)

$: note("c4 a3 f3 e3").s("sawtooth")
  .lpf(2500).room(.6).release(.3).gain(.4)

$: note("g#4@2 ~ f#4 f4@2 ~ d#4 d4").s("square")
  .lpf(2000).room(.4).release(.2).gain(.35)

$: note("e1 ~ ~ e2 ~ e1 ~ ~").s("sawtooth")
  .lpf(700).room(.3).release(.25).gain(.5)
