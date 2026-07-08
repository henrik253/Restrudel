setcpm(110/4)

$: s("bd ~ ~ ~").bank("RolandTR909").gain(.8)

$: s("~ hh:2 ~ hh:2*2").gain(.2)

$: note("a3 c4 e4 c4 e4 g4 c5 g3").sound("sine").lpf(3000).gain(.35)

$: note("c4 eb4 g4 bb4").sound("gm_oboe").slow(2).room(.4).gain(.3)
