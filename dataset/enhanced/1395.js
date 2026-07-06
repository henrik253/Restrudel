setcpm(94/4)

$: note("<g2 e2 c2 d2>").s("recorder_bass_sus").attack(.1).release(.4).gain(.4)

$: note("<[g3,b3,d4] [e3,g3,b3] [c3,e3,g3] [d3,f#3,a3]>").s("piano").release(.5).room(.5).gain(.35)

$: s("woodblock:1 ~ woodblock:2 ~ ~ woodblock:1 ~ ~").gain(.3).pan(.6)

$: s("bd ~ [lt lt] ~").gain(.6)

$: n("~ 7 ~ [9 7]").scale("g:major").s("piano").release(.3).gain(.3).delay(.3)
