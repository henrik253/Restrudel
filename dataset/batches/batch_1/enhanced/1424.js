setcpm(114/4)

$: s("bd ~ sd:0 ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: s("~ cymbal ~ ~").gain(.25).room(.4)

$: note("c2 g1 c2 eb2").s("gm_acoustic_bass")
  .lpf(700).release(.2).gain(.5)

$: n("0 3 7 5 3 0 5 3").scale("c:minor").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)
