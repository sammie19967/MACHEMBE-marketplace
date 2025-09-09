import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export const showModal = ({ 
  title, 
  text, 
  icon = 'success', 
  confirmButtonText = 'OK',
  timer
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    timer,
    confirmButtonColor: '#3B82F6',
    timerProgressBar: true,
    customClass: {
      container: 'font-sans',
      popup: 'rounded-lg',
      confirmButton: 'px-4 py-2 rounded-md'
    }
  });
};