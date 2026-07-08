setcpm(112/4)
$: s("bd*2 ~").gain(.7)
$: s("gm_piano ~").gain(.4)
$: note("b4 a4 b4 c5").sound("square").lpf(2000).room(.5).gain(.35)
