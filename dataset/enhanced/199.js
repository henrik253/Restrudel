setcpm(100/4)

$: n("0 -1 4 5 3 4 2 3 1 ~ ~ ~").scale("a:minor").s("sawtooth").lpf(1800).release(.2).gain(.35)

$: n("<[0,2,4] [-3,0,2]>").scale("a:minor").s("gm_synth_strings_2").attack(.3).release(.5).room(.8).gain(.25)

$: note("a1 ~ e1 a1").s("square").lpf(450).release(.2).gain(.5)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh*4").gain(.2).room(.3)
