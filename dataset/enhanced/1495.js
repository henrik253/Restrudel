setcpm(96/4)

$: note("b4 ~ a#4@2 f#4@2 ~ ~").s("gm_acoustic_guitar_steel:2").release(.3).room(.5).gain(.35)

$: note("<[b2,d#3,f#3] [g#2,b2,e3]>").s("gm_epiano1:1").release(.5).room(.4).gain(.3)

$: s("bd ~ sd ~ ~ bd sd ~").bank("EmuDrumulator").gain(.75)

$: s("~ ~ mt ~").bank("EmuDrumulator").slow(2).gain(.4)

$: note("b1 ~ ~ b1 ~ ~ f#1 ~").s("sine").release(.25).gain(.5)
