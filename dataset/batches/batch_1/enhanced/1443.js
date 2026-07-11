setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("woodblock:1 woodblock:2 woodblock:1 ~").release(.08).attack(.02).gain(.4)

$: note("c2 ~ eb g bb d c a f e d c a f e d").sound("triangle").lpf(800)
  .hpf(200).release(.2).room(.6).delay(.25).delaytime(.12).gain(.45)

$: note("<c2 c2 g1 f1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
