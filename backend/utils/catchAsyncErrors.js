const catchAsyncErrors = (controller) => {
  return async (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsyncErrors;
