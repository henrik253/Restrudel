setcpm(118/4)

$: s("bd ~ sd ~ bd bd sd ~").bank("RolandTR909").gain(.8)

$: note("d2 d2 d2 d2 g#2 g2 a#2 c3").s("sawtooth").lpf(700).resonance(5).release(.12).gain(.45)

$: note("<d4 [~ f4] eb4 [f4 d4]>").s("gm_tenor_sax").release(.2).delay(.5).delaytime(.375).gain(.3)

$: s("~ ~ cowbell ~").gain(.25)

$: s("hh*8").gain(.15)
