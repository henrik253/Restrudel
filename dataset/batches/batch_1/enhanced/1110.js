setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2).release(.4).room(.9)

$: n("0 -7 3 4 2 3 -4 4").scale("g:dorian").s("gm_synth_strings_1")
  .lpf(2000).release(.4).room(.5).gain(.4)

$: note("g2 d2 g2 f2").s("sawtooth").lpf(700)
  .release(.25).gain(.45)
