setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("c3 d#3@2 c#3 c3 a#2 f2@2 g#2").s("sawtooth")
  .lpf(700).release(.25).gain(.5)

$: note("<c4 g4 c5 f4>").s("square")
  .lpf(2000).release(.2).gain(.35)

$: n("<0 3 5 7>").scale("c:minor").s("gm_pad_warm")
  .room(.5).release(.4).gain("<.35 .3>")
