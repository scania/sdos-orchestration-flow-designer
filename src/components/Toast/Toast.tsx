import { useEffect } from 'react'

const Toast = ({ listOfToasts, setListOfToasts, timeout }) => {

  useEffect(() => {
    const interval = setInterval(() => {
      if(listOfToasts.length) {
        setListOfToasts([]);
      }
    }, timeout || 5000);

    return () => {
      clearInterval(interval);
    }
  }, [listOfToasts]);

  return (
    <div style={{position: 'fixed', bottom: '32px', right: '10px'}}>
      {
        listOfToasts.map((toast, i) => (
        <tds-toast
          key={i}
          variant={toast.variant}
          header={toast.header}
          subheader={toast.description}
        />
        ))
      }
    </div>
  )
}

export default Toast