setcpm(120/4)
$: s("pulse ~ pulse ~").gain(.6)
$: s("hh*3").gain(.2)
$: s("gm_electric_guitar_jazz").note("c4 e4 g4 c5").lpf(2000).room(.5).gain(.35)
