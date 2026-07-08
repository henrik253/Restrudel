setcpm(120/4)

$: s("vocal ~").clip(1).room(.6964).gain(.6)

$: n("5 4 4 ~").s("perc*3 gm_marimba").room(.9492).gain(.3).release(.4196)

$: note("d5 e5").s("supersaw").lpf(3000).gain(.4)

$: note("d#5@2 d5@2 c#5@2 a4@10").add(-3).s("square").gain(.3)
