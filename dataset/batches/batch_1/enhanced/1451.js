setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ misc:2 ~ sd:1").gain(.5).room(.3)

$: n("<0 3 5 3>").scale("c:minor").s("gm_synth_strings_1")
  .clip("[.5 1]*2").gain(.4).room(.4)

$: n("0 3 7 5 0 3 7 5").scale("c:minor").s("gm_epiano1")
  .lpf(2000).gain(.35).room(.3)

$: n("<c2 c2 f1 g1>").scale("c:minor").s("gm_electric_bass_finger")
  .lpf(600).release(.25).gain(.5)
