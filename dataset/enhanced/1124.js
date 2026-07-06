setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("cowbell ~ cowbell ~").gain(.3).pan(.6)

$: n("9 ~ 6 ~").scale("a:minor").s("gm_oboe")
  .lpf(3200).release(.2).room(.3).gain(.4)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("gm_synth_strings_1")
  .lpf(700).release(.3).gain(.4)
