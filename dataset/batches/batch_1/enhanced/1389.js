setcpm(90/4)

$: n("<[0,2,4] [-1,1,4]>").scale("e:minor").s("gm_pad_warm").attack(.3).release(1).room(1).gain(.25)

$: s("woodblock:1 [woodblock:2 woodblock:2] snare_rim:0 ~").gain(.4).room(1).delay(.6).delaytime(.33).delayfeedback(.5)

$: s("~ ~ ~ gong").slow(2).gain(.3).room(.8)

$: n("<0 ~ 5 3>").scale("e:minor").s("gm_ocarina").delay(.5).gain(.35).release(.3)

$: note("e2 ~ ~ ~ c2 ~ ~ d2").s("sawtooth").lpf(400).release(.3).gain(.45)
