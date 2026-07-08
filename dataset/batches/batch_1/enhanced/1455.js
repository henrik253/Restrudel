setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("~ sleighbells ~ sleighbells").gain(.2).pan(.6)

$: note("e3 ~ c3 c3").s("gm_electric_bass_pick")
  .delay(.37).delaytime(.75).delayfeedback(.5).lpf(700).gain(.5).orbit(2)

$: note("<e4 g4 b4 g4>").s("flute")
  .lpf(3000).room(.4).delay(.3).gain(.35)
