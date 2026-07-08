setcpm(124/4)

$: n("<[0,2,4] [0,3,5]>").scale("a:minor").s("sawtooth").attack(.15).release(.4).hpf(500).lpf(3000).gain(.25).room(.6)

$: s("hh*2 hh*3 hh*2 [hh hh]").velocity(.55).gain(.25)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: note("a1 ~ a1 c2 ~ a1 e2 ~").s("square").lpf(600).release(.12).gain(.45)
