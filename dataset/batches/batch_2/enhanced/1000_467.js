setcpm(100/4)
$: s("perc*3").slow(2).gain(.5)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.7)
$: note("<[g3 bb3 d4 f4] [c4 e4 g4 bb4] [f3 a3 c4 e4]>").sound("piano").lpf(4618).room(.6).delay("<0 .5>").gain(.4)
