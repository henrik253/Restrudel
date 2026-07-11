setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("~ c#5 b4 a#4").sound("clavisynth").lpf(2000)
  .release(.2).room(.3).gain(.4)

$: note("c2 g1 c2 f1").s("gm_acoustic_bass")
  .lpf(700).release(.2).gain(.5)
