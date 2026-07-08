setcpm(100/4)

$: s("lt cr").gain(.5).release(.1)

$: s("~ hh*2 ~").lpf(2800).room(1.0074).gain(.2)

$: s("gm_acoustic_bass gm_electric_bass_finger:7").gain(.45)
